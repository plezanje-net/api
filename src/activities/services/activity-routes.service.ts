import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationMeta } from 'src/core/utils/pagination-meta.class';
import { Route } from 'src/crags/entities/route.entity';
import { User } from 'src/users/entities/user.entity';
import {
  FindManyOptions,
  In,
  IsNull,
  LessThan,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { CreateActivityRouteInput } from '../dtos/create-activity-route.input';
import { FindActivityRoutesInput } from '../dtos/find-activity-routes.input';
import { ActivityRoute } from '../entities/activity-route.entity';
import { Activity } from '../entities/activity.entity';
import { PaginatedActivityRoutes } from '../utils/paginated-activity-routes.class';

@Injectable()
export class ActivityRoutesService {
  constructor(
    @InjectRepository(ActivityRoute)
    private activityRoutesRepository: Repository<ActivityRoute>,
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
  ) {}

  async create(
    data: CreateActivityRouteInput,
    user: User,
    activity?: Activity,
  ): Promise<ActivityRoute> {
    const activityRoute = new ActivityRoute();

    this.activityRoutesRepository.merge(activityRoute, data);

    activityRoute.user = Promise.resolve(user);

    if (data.routeId != null) {
      activityRoute.route = Promise.resolve(
        await this.routesRepository.findOneOrFail(data.routeId),
      );
    }

    if (activity != null) {
      activityRoute.activity = Promise.resolve(activity);
    }

    return this.activityRoutesRepository.save(activityRoute);
  }

  async paginate(
    params: FindActivityRoutesInput = {},
  ): Promise<PaginatedActivityRoutes> {
    const options = this.parseOptions(params);

    const itemCount = await this.activityRoutesRepository.count(options);

    const pagination = new PaginationMeta(
      itemCount,
      params.pageNumber,
      params.pageSize,
    );

    options.skip = pagination.pageSize * (pagination.pageNumber - 1);
    options.take = pagination.pageSize;

    return Promise.resolve({
      items: await this.activityRoutesRepository.find(options),
      meta: pagination,
    });
  }

  async find(params: FindActivityRoutesInput = {}): Promise<ActivityRoute[]> {
    return this.activityRoutesRepository.find(this.parseOptions(params));
  }

  private parseOptions(params: FindActivityRoutesInput): FindManyOptions {
    const options: FindManyOptions = {
      order: {},
    };

    if (params.orderBy != null) {
      options.order[params.orderBy.field || 'created'] =
        params.orderBy.direction || 'DESC';
    } else {
      options.order['created'] = 'DESC';
    }

    const where: any = {};

    if (params.orderBy != null && params.orderBy.field == 'grade') {
      where.grade = Not(IsNull());
    }

    if (params.userId != null) {
      where.user = params.userId;
    }

    if (params.ascentType != null) {
      where.ascentType = In(params.ascentType);
    }

    if (params.publish != null) {
      where.publish = In(params.publish);
    }

    if (params.dateFrom != null) {
      where.date = MoreThan(params.dateFrom);
    }

    if (params.dateTo != null) {
      where.date = LessThan(params.dateTo);
    }

    options.where = where;

    return options;
  }
}
