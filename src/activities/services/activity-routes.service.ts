import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { Route } from '../../crags/entities/route.entity';
import { ClubMember } from '../../users/entities/club-member.entity';
import { Club } from '../../users/entities/club.entity';
import { User } from '../../users/entities/user.entity';
import {
  getConnection,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CreateActivityRouteInput } from '../dtos/create-activity-route.input';
import { FindActivityRoutesInput } from '../dtos/find-activity-routes.input';
import {
  ActivityRoute,
  AscentType,
  tickAscentTypes,
} from '../entities/activity-route.entity';
import { Activity } from '../entities/activity.entity';
import { PaginatedActivityRoutes } from '../utils/paginated-activity-routes.class';
import { DifficultyVote } from '../../crags/entities/difficulty-vote.entity';

@Injectable()
export class ActivityRoutesService {
  constructor(
    @InjectRepository(ActivityRoute)
    private activityRoutesRepository: Repository<ActivityRoute>,
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    @InjectRepository(ClubMember)
    private clubMembersRepository: Repository<ClubMember>,
    @InjectRepository(Club)
    private clubsRepository: Repository<Club>,
    @InjectRepository(DifficultyVote)
    private difficultyVoteRepository: Repository<DifficultyVote>,
  ) {}

  async create(
    queryRunner: QueryRunner,
    routeIn: CreateActivityRouteInput,
    user: User,
    activity?: Activity,
  ): Promise<ActivityRoute> {
    const activityRoute = new ActivityRoute();

    this.activityRoutesRepository.merge(activityRoute, routeIn);

    activityRoute.user = Promise.resolve(user);

    if (routeIn.routeId !== null) {
      const route = await this.routesRepository.findOneOrFail(routeIn.routeId);
      const routeTouched = await this.routeTouched(user, routeIn.routeId);
      const logPossible = this.logPossible(
        routeTouched.ticked,
        routeTouched.tried,
        routeIn.ascentType,
        route.routeTypeId,
      );
      if (!logPossible) {
        throw new HttpException('Impossible log', HttpStatus.NOT_ACCEPTABLE);
      }

      activityRoute.route = Promise.resolve(route);

      // if a vote on difficulty is passed add a new difficulty vote or update existing
      if (routeIn.votedDifficulty) {
        // but first check if a user even can vote (can vote only if the log is a tick)
        if (!tickAscentTypes.some(at => at === routeIn.ascentType)) {
          throw new HttpException(
            'Cannot vote on difficulty if not a tick',
            HttpStatus.NOT_ACCEPTABLE,
          );
        }

        let difficultyVote = await this.difficultyVoteRepository.findOne({
          user,
          route,
        });
        if (!difficultyVote) {
          difficultyVote = new DifficultyVote();
          difficultyVote.route = Promise.resolve(route);
          difficultyVote.user = Promise.resolve(user);
        }
        difficultyVote.difficulty = routeIn.votedDifficulty;

        // if a route that is being ticked is/was a project, then the first vote is a base vote, and the route ceases to be a project
        if (route.isProject) {
          difficultyVote.isBase = true;
          route.isProject = false;
          await queryRunner.manager.save(route);
        }

        await queryRunner.manager.save(difficultyVote);
      }
    }

    if (activity !== null) {
      activityRoute.activity = Promise.resolve(activity);
    }

    return queryRunner.manager.save(activityRoute);
  }

  /**
   *
   * check if logging a route is even possible
   * e.g. onsighting a route already tried is impossible and so on
   *
   */
  private logPossible(
    routeTicked: boolean,
    routeTried: boolean,
    ascentType: string,
    routeTypeId: string,
  ): boolean {
    // boulders cannot be onsighted at all
    if (routeTypeId === 'boulder') {
      if (
        ascentType === AscentType.ONSIGHT ||
        ascentType === AscentType.T_ONSIGHT
      )
        return false;
    }

    // already tried routes cannot be onsighted or flashed
    if (routeTried) {
      if (
        ascentType === AscentType.ONSIGHT ||
        ascentType === AscentType.T_ONSIGHT ||
        ascentType === AscentType.FLASH ||
        ascentType === AscentType.T_FLASH
      )
        return false;
    }

    // already ticked routes cannot be redpointed (flash, sight included above)
    if (routeTicked) {
      if (
        ascentType === AscentType.REDPOINT ||
        ascentType === AscentType.T_REDPOINT
      )
        return false;
    }

    return true;
  }

  async routeTouched(user: User, routeId: string) {
    const connection = getConnection();

    const query = connection
      .createQueryBuilder()
      .select('tried')
      .addSelect('ticked')
      .from(subQuery => {
        return subQuery
          .select('count(*) > 0', 'tried')
          .from('activity_route', 'ar')
          .where('ar.routeId = :routeId', { routeId: routeId })
          .andWhere('ar.userId = :userId', { userId: user.id });
      }, 'tried')
      .addFrom(subQuery => {
        return subQuery
          .select('count(*) > 0', 'ticked')
          .from('activity_route', 'ar')
          .where('ar.routeId = :routeId', { routeId: routeId })
          .andWhere('ar.userId = :userId', { userId: user.id })
          .andWhere('ar.ascentType IN (:...aTypes)', {
            aTypes: [...tickAscentTypes],
          });
      }, 'ticked')
      .getRawMany();

    const result = await query;

    return result[0];
  }

  async cragSummary(
    params: FindActivityRoutesInput = {},
  ): Promise<ActivityRoute[]> {
    const builder = this.activityRoutesRepository.createQueryBuilder('ar');

    builder.distinctOn(['ar."routeId"']);
    builder.orderBy('ar."routeId"');
    builder.addOrderBy('ar."ascentType"'); // note: ascentType is an enum ordered by most valued ascent type (ie onsight) toward least valued (ie t_attempt)

    if (params.userId != null) {
      builder.andWhere('ar."userId" = :userId', {
        userId: params.userId,
      });
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

    return builder.getMany();
  }

  // TODO: DRY
  async finbByClubSlug(
    user: User,
    clubSlug: string,
    params: FindActivityRoutesInput = {},
  ): Promise<PaginatedActivityRoutes> {
    // if current user is not member of the club, reject access to activity routes data
    const club = await this.clubsRepository.findOneOrFail({
      where: { slug: clubSlug },
    });
    const clubMember = await this.clubMembersRepository.findOne({
      where: {
        user: user.id,
        club: club.id,
      },
    });
    if (!clubMember) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    const query = this.buildQuery(params);
    query
      .leftJoinAndSelect('ar.user', 'user')
      .leftJoinAndSelect('user.clubs', 'clubMember')
      .leftJoinAndSelect('clubMember.club', 'club')
      .andWhere('"club"."id" = :clubId', { clubId: club.id });

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

  async latestTicks(latest: number): Promise<ActivityRoute[]> {
    const builder = this.activityRoutesRepository.createQueryBuilder('ar');

    builder
      .addSelect('DATE(ar.date) AS ardate')
      .addSelect(
        "(r.difficulty + (ar.ascentType='onsight')::int * 100 + (ar.ascentType='flash')::int * 50) as score",
      )
      .leftJoin('route', 'r', 'ar.routeId = r.id')
      .distinctOn(['ardate', 'ar.userId'])
      .where('ar.ascentType IN (:...aTypes)', {
        aTypes: tickAscentTypes,
      })
      .andWhere('ar.publish IN (:...publish)', {
        publish: ['log', 'public'],
      })
      .andWhere('ar.routeId IS NOT NULL') // TODO: what are activity routes with no route id??
      .andWhere('r.difficulty IS NOT NULL') // TODO: entries with null values for grade? -> multipitch? - skip for now
      .orderBy('ardate', 'DESC')
      .addOrderBy('ar.userId', 'DESC')
      .addOrderBy('score', 'DESC')
      .addOrderBy('ar.ascentType', 'ASC')
      .limit(latest);

    /*
    comparing redpoint, flash, onsight:
    8b rp ~ 8a+ f ~ 8a os
    TODO: should implement scoring?
    */

    const ticks = builder.getMany();
    return ticks;
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

    // TODO: fix after grade->difficulty change
    // if (params.orderBy != null && params.orderBy.field == 'grade') {
    //   builder.andWhere('ar.grade IS NOT NULL');
    // }

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
