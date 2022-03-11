import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { Crag } from '../../crags/entities/crag.entity';
import { User } from '../../users/entities/user.entity';
import {
  Connection,
  FindManyOptions,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CreateActivityInput } from '../dtos/create-activity.input';
import { FindActivitiesInput } from '../dtos/find-activities.input';
import { Activity } from '../entities/activity.entity';
import { PaginatedActivities } from '../utils/paginated-activities.class';
import { CreateActivityRouteInput } from '../dtos/create-activity-route.input';
import { ActivityRoutesService } from './activity-routes.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
    @InjectRepository(Crag)
    private cragRepository: Repository<Crag>,
    private connection: Connection,
    private activityRoutesService: ActivityRoutesService,
  ) {}

  async createActivityWRoutes(
    activityIn: CreateActivityInput,
    user: User,
    routesIn: CreateActivityRouteInput[],
  ): Promise<Activity> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create new activity
      const activity = new Activity();
      this.activitiesRepository.merge(activity, activityIn);
      activity.user = Promise.resolve(user);
      if (activityIn.cragId != null) {
        activity.crag = Promise.resolve(
          await this.cragRepository.findOneOrFail(activityIn.cragId),
        );
      }
      await queryRunner.manager.save(activity);

      // Create activity-route for each route belonging to this activity
      await Promise.all(
        routesIn.map(async route => {
          await this.activityRoutesService.create(
            queryRunner,
            route,
            user,
            activity,
          );
        }),
      );

      await queryRunner.commitTransaction();
      return activity;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      throw exception;
    } finally {
      await queryRunner.release();
    }
  }

  async findOneById(id: string): Promise<Activity> {
    return this.activitiesRepository.findOneOrFail(id);
  }

  async paginate(
    params: FindActivitiesInput = {},
  ): Promise<PaginatedActivities> {
    const query = this.buildQuery(params);

    const itemCount = await query.getCount();

    const pagination = new PaginationMeta(
      itemCount,
      params.pageNumber,
      params.pageSize,
    );

    query
      .skip(pagination.pageSize * (pagination.pageNumber - 1))
      .take(pagination.pageSize);

    return Promise.resolve({
      items: await query.getMany(),
      meta: pagination,
    });
  }

  async find(params: FindActivitiesInput = {}): Promise<Activity[]> {
    return this.buildQuery(params).getMany();
  }

  private buildQuery(
    params: FindActivitiesInput = {},
  ): SelectQueryBuilder<Activity> {
    const builder = this.activitiesRepository.createQueryBuilder('a');

    if (params.orderBy != null) {
      builder.orderBy(
        params.orderBy.field != null
          ? 'a.' + params.orderBy.field
          : 'a.created',
        params.orderBy.direction || 'DESC',
      );
    } else {
      builder.orderBy('a.created', 'DESC');
    }
    // add order by last modification datetime in all cases so that ordering activities within the same day is right
    builder.addOrderBy(
      'a.updated',
      params.orderBy.direction && params.orderBy.field === 'date'
        ? params.orderBy.direction
        : 'DESC',
    );

    if (params.orderBy != null && params.orderBy.field == 'grade') {
      builder.andWhere('a.grade IS NOT NULL');
    }

    if (params.userId != null) {
      builder.andWhere('a."userId" = :userId', {
        userId: params.userId,
      });
    }

    if (params.dateFrom != null) {
      builder.andWhere('a.date >= :dateFrom', { dateFrom: params.dateFrom });
    }

    if (params.dateTo != null) {
      builder.andWhere('a.date <= :dateTo', { dateTo: params.dateTo });
    }

    if (params.type != null) {
      builder.andWhere('a."type" IN (:...type)', {
        type: params.type,
      });
    }

    if (params.cragId != null) {
      builder.andWhere('a."cragId" = :cragId', { cragId: params.cragId });
    }

    return builder;
  }

  async delete(activity: Activity): Promise<boolean> {
    return this.activitiesRepository.remove(activity).then(() => true);
  }
}
