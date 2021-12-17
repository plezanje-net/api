import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { Crag } from '../../crags/entities/crag.entity';
import { User } from '../../users/entities/user.entity';
import {
  FindManyOptions,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CreateActivityInput } from '../dtos/create-activity.input';
import { FindActivitiesInput } from '../dtos/find-activities.input';
import { Activity } from '../entities/activity.entity';
import { PaginatedActivities } from '../utils/paginated-activities.class';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
    @InjectRepository(Crag)
    private cragRepository: Repository<Crag>,
  ) {}

  async create(
    queryRunner: QueryRunner,
    data: CreateActivityInput,
    user: User,
  ): Promise<Activity> {
    const activity = new Activity();

    this.activitiesRepository.merge(activity, data);

    activity.user = Promise.resolve(user);

    if (data.cragId != null) {
      activity.crag = Promise.resolve(
        await this.cragRepository.findOneOrFail(data.cragId),
      );
    }

    return queryRunner.manager.save(activity);
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
}
