import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationMeta } from 'src/core/utils/pagination-meta.class';
import { Route } from 'src/crags/entities/route.entity';
import { ClubMember } from 'src/users/entities/club-member.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
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
    @InjectRepository(ClubMember)
    private clubMembersRepository: Repository<ClubMember>,
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

  // TODO: DRY
  async finbByClub(
    user: User,
    clubId: string,
    params: FindActivityRoutesInput = {},
  ): Promise<PaginatedActivityRoutes> {
    // if current user is not member of the club, reject access to activity routes data
    const clubMember = await this.clubMembersRepository.findOne({
      where: {
        user: user.id,
        club: clubId,
      },
    });
    if (!clubMember) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    const query = this.buildQuery(params);
    query
      .leftJoinAndSelect('ar.user', 'user')
      .leftJoinAndSelect('user.clubs', 'clubMember')
      .leftJoinAndSelect('clubMember.club', 'club')
      .andWhere('"club"."id" = :clubId', { clubId });

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

  async paginate(
    params: FindActivityRoutesInput = {},
  ): Promise<PaginatedActivityRoutes> {
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

  async find(params: FindActivityRoutesInput = {}): Promise<ActivityRoute[]> {
    return this.buildQuery(params).getMany();
  }

  private buildQuery(
    params: FindActivityRoutesInput = {},
  ): SelectQueryBuilder<ActivityRoute> {
    const builder = this.activityRoutesRepository.createQueryBuilder('ar');

    if (params.orderBy != null) {
      builder.orderBy(
        params.orderBy.field != null
          ? 'ar.' + params.orderBy.field
          : 'ar.created',
        params.orderBy.direction || 'DESC',
      );
    } else {
      builder.orderBy('ar.created', 'DESC');
    }

    if (params.cragId != null) {
      builder.innerJoin(
        'activity',
        'activity',
        'ar."activityId" = activity.id',
      );
      builder.andWhere('activity."cragId" = :cragId', {
        cragId: params.cragId,
      });
    }

    if (params.orderBy != null && params.orderBy.field == 'grade') {
      builder.andWhere('ar.grade IS NOT NULL');
    }

    if (params.userId != null) {
      builder.andWhere('ar."userId" = :userId', {
        userId: params.userId,
      });
    }

    if (params.ascentType != null) {
      builder.andWhere('ar."ascentType" IN (:...ascentType)', {
        ascentType: params.ascentType,
      });
    }

    if (params.publish != null) {
      builder.andWhere('ar."publish" IN (:...publish)', {
        publish: params.publish,
      });
    }

    if (params.dateFrom != null) {
      builder.andWhere('ar.date >= :dateFrom', { dateFrom: params.dateFrom });
    }

    if (params.dateTo != null) {
      builder.andWhere('ar.date <= :dateTo', { dateTo: params.dateTo });
    }

    if (params.routeId != null) {
      builder.andWhere('ar."routeId" = :routeId', { routeId: params.routeId });
    }

    return builder;
  }
}
