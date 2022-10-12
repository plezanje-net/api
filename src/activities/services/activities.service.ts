import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { Crag } from '../../crags/entities/crag.entity';
import { User } from '../../users/entities/user.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateActivityInput } from '../dtos/create-activity.input';
import { FindActivitiesInput } from '../dtos/find-activities.input';
import { Activity } from '../entities/activity.entity';
import { PaginatedActivities } from '../utils/paginated-activities.class';
import { CreateActivityRouteInput } from '../dtos/create-activity-route.input';
import { ActivityRoutesService } from './activity-routes.service';
import { UpdateActivityInput } from '../dtos/update-activity.input';
import { ActivityRoute } from '../entities/activity-route.entity';
import { Route } from '../../crags/entities/route.entity';
import { setBuilderCache } from '../../core/utils/entity-cache/entity-cache-helpers';
import { getPublishStatusParams } from '../../core/utils/contributable-helpers';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
    @InjectRepository(Crag)
    private cragRepository: Repository<Crag>,
    private dataSource: DataSource,
    private activityRoutesService: ActivityRoutesService,
  ) {}

  async createActivityWRoutes(
    activityIn: CreateActivityInput,
    user: User,
    routesIn: CreateActivityRouteInput[],
    dryRun = false,
    sideEffects = [],
  ): Promise<Activity> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (activityIn.date.getTime() > today.getTime()) {
      throw new HttpException(
        'Invalid date: cannot log into the future.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create new activity
      const activity = new Activity();

      this.activitiesRepository.merge(activity, activityIn);

      activity.user = Promise.resolve(user);

      if (activityIn.cragId != null) {
        activity.crag = Promise.resolve(
          await this.cragRepository.findOneByOrFail({ id: activityIn.cragId }),
        );
      }
      await queryRunner.manager.save(activity);

      // Create activity-route for each route belonging to this activity. Process them in sequential order because one can log a single route more than once in a single post, and should take that into account when validating the logs
      for (const routeIn of routesIn) {
        await this.activityRoutesService.create(
          queryRunner,
          routeIn,
          user,
          activity,
          sideEffects,
        );
      }

      if (dryRun) {
        await queryRunner.rollbackTransaction();
        return Promise.resolve(null);
      } else {
        await queryRunner.commitTransaction();
        return activity;
      }
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      throw exception;
    } finally {
      await queryRunner.release();
    }
  }

  async updateActivityWithRoutes(
    activityIn: UpdateActivityInput,
    user: User,
    routesIn: CreateActivityRouteInput[],
    dryRun = false,
    sideEffects = [],
  ): Promise<Activity> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (activityIn.date.getTime() > today.getTime()) {
      throw new HttpException(
        'Invalid date: cannot log into the future.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // TODO: refactor as it breaks DRY heavily, make sure that date did not change, update AR dates from activity date
      // Create new activity
      const activity = await this.activitiesRepository.findOneByOrFail({
        id: activityIn.id,
      });
      this.activitiesRepository.merge(activity, activityIn);

      activity.user = Promise.resolve(user);

      await queryRunner.manager.save(activity);

      for (const routeIn of routesIn) {
        await this.activityRoutesService.create(
          queryRunner,
          routeIn,
          user,
          activity,
          sideEffects,
        );
      }

      if (dryRun) {
        await queryRunner.rollbackTransaction();
        return Promise.resolve(null);
      } else {
        await queryRunner.commitTransaction();
        return activity;
      }
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      throw exception;
    } finally {
      await queryRunner.release();
    }
  }

  async findOneById(id: string, currentUser: User = null): Promise<Activity> {
    return (await this.buildQuery({}, currentUser))
      .andWhereInIds([id])
      .getOneOrFail();
  }

  async paginate(
    params: FindActivitiesInput = {},
    currentUser: User = null,
  ): Promise<PaginatedActivities> {
    const query = await this.buildQuery(params, currentUser);

    const countQuery = query
      .clone()
      .select('COUNT(DISTINCT(a.id))', 'count')
      .groupBy(null)
      .orderBy(null);

    setBuilderCache(countQuery, 'getRawOne');
    const itemCount = await countQuery.getRawOne();

    const pagination = new PaginationMeta(
      itemCount.count,
      params.pageNumber,
      params.pageSize,
    );

    query
      .groupBy('a.id')
      .offset(pagination.pageSize * (pagination.pageNumber - 1))
      .limit(pagination.pageSize);

    setBuilderCache(query);

    return Promise.resolve({
      items: await query.getMany(),
      meta: pagination,
    });
  }

  async find(params: FindActivitiesInput = {}): Promise<Activity[]> {
    return (await this.buildQuery(params)).getMany();
  }

  async findByIds(ids: string[], currentUser: User): Promise<Activity[]> {
    return (await this.buildQuery({}, currentUser)).whereInIds(ids).getMany();
  }

  private async buildQuery(
    params: FindActivitiesInput = {},
    currentUser: User = null,
  ): Promise<SelectQueryBuilder<Activity>> {
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
      params.orderBy &&
        params.orderBy.direction &&
        params.orderBy.field === 'date'
        ? params.orderBy.direction
        : 'DESC',
    );

    // TODO: ??? activity has no such field as grade
    if (params.orderBy != null && params.orderBy.field == 'grade') {
      builder.andWhere('a.grade IS NOT NULL');
    }

    // TODO: should we rename this param to: forUserId?
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

    builder.leftJoin(Crag, 'c', 'c.id = a."cragId"');
    // If no current user is passed in, that means we are serving a guest
    if (!currentUser) {
      // Right now, only crag activity might be public, so disallow all other types
      builder.andWhere("a.type = 'crag'");

      // Allow/disallow based on publish type of contained activity routes
      //  --> Inner join activity routes to get only activities with at least one public activity route
      builder.innerJoin(
        ActivityRoute,
        'ar',
        'ar."activityId" = a.id AND (ar."publish" IN (:...publish))',
        { publish: ['log', 'public'] },
      );

      // Allow/disallow based on publishStatus of contained activity routes
      //  --> allow only activities with at least one published activity route
      builder.innerJoin(
        Route,
        'r',
        'r.id = ar."routeId" AND r."publishStatus" = \'published\'',
      );

      // Disallow activities in crags that are hidden
      builder.andWhere('c."isHidden" = false');

      // Allow/disallow based on publishStatus of activitiy's crag (might be redundant to the ar condition)
      builder.andWhere("c.publishStatus = 'published'");
    } else {
      // User is logged in

      const { conditions: cragPublishConditions, params: cragPublishParams } =
        await getPublishStatusParams('c', currentUser);

      const { conditions: routePublishConditions, params: routePublishParams } =
        await getPublishStatusParams('r', currentUser);

      // Apply crag publish rules unless activity user is the current user
      builder.andWhere(`(a."userId" = :userId OR (${cragPublishConditions}))`, {
        userId: currentUser.id,
        ...cragPublishParams,
      });

      // Allow/disallow based on publish type of contained activity routes
      // --> allow only activities that belong to the current user or contain at least one activity route that is public (or log)
      // builder.leftJoin(ActivityRoute, 'ar', 'ar."activityId" = a.id');
      builder.leftJoin(ActivityRoute, 'ar', 'ar."activityId" = a.id');
      builder.andWhere(
        '(a."userId" = :userId OR ar."publish" IN (\'log\', \'public\'))',
        {
          userId: currentUser.id,
        },
      );

      // Apply route publish rules unless activity user is the current user
      builder.leftJoin(Route, 'r', `r.id = ar."routeId"`, routePublishParams);
      builder.andWhere(
        `(a."userId" = :userId OR (${routePublishConditions}))`,
        { userId: currentUser.id, ...routePublishParams },
      );
      // TODO: should also allow showing club ascents
    }

    if (params.hasRoutesWithPublish) {
      builder.andWhere('ar."publish" IN (:...publish)', {
        publish: params.hasRoutesWithPublish,
      });
    }

    return builder;
  }

  async delete(activity: Activity): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const activityRoutes = await activity.routes;
      for (const activityRoute of activityRoutes) {
        await this.activityRoutesService.delete(activityRoute, queryRunner);
      }

      await queryRunner.manager.remove(Activity, activity);
      await queryRunner.commitTransaction();
      return true;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      throw exception;
    } finally {
      await queryRunner.release();
    }
  }
}
