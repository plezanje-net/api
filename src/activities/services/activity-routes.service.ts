import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { Route } from '../../crags/entities/route.entity';
import {
  ClubMember,
  ClubMemberStatus,
} from '../../users/entities/club-member.entity';
import { Club } from '../../users/entities/club.entity';
import { User } from '../../users/entities/user.entity';
import {
  Connection,
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
  firstTickAscentTypes,
  trTickAscentTypes,
  firstTrTickAscentTypes,
} from '../entities/activity-route.entity';
import { Activity } from '../entities/activity.entity';
import { PaginatedActivityRoutes } from '../utils/paginated-activity-routes.class';
import { DifficultyVote } from '../../crags/entities/difficulty-vote.entity';
import { CragStatus } from '../../crags/entities/crag.entity';
import { StarRatingVote } from '../../crags/entities/star-rating-vote.entity';
import { UpdateActivityRouteInput } from '../dtos/update-activity-route.input';
import { RoutesTouches } from '../utils/routes-touches.class';
import { FindRoutesTouchesInput } from '../dtos/find-routes-touches.input';
import { SideEffect } from '../utils/side-effect.class';

@Injectable()
export class ActivityRoutesService {
  constructor(
    private connection: Connection,
    @InjectRepository(ActivityRoute)
    private activityRoutesRepository: Repository<ActivityRoute>,
    @InjectRepository(ClubMember)
    private clubMembersRepository: Repository<ClubMember>,
    @InjectRepository(Club)
    private clubsRepository: Repository<Club>,
  ) {}

  async createBatch(
    user: User,
    routesIn: CreateActivityRouteInput[],
  ): Promise<ActivityRoute[]> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdActivityRoutes: ActivityRoute[] = [];

    try {
      // Create activity-route for each route. Process them in sequential order because one can log a single route more than once in a single post, and should take that into account when validating the logs
      for (const routeIn of routesIn) {
        createdActivityRoutes.push(
          await this.create(queryRunner, routeIn, user),
        );
      }

      await queryRunner.commitTransaction();
      return createdActivityRoutes;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      throw exception;
    } finally {
      await queryRunner.release();
    }
  }

  async create(
    queryRunner: QueryRunner,
    routeIn: CreateActivityRouteInput,
    user: User,
    activity?: Activity,
    sideEffects: SideEffect[] = [],
  ): Promise<ActivityRoute> {
    const activityRoute = new ActivityRoute();

    queryRunner.manager.merge(ActivityRoute, activityRoute, routeIn);

    activityRoute.user = Promise.resolve(user);

    const route = await queryRunner.manager.findOneOrFail(
      Route,
      routeIn.routeId,
    );

    // TODO: should make final decision on wether the routes can be logged without activity. Date here depends on activity!
    const routeTouched = await this.getTouchesForRoutes(
      new FindRoutesTouchesInput([routeIn.routeId], user.id, activity.date),
      queryRunner,
    );

    const logPossible = this.logPossible(
      routeTouched.ticked.some(ar => ar.routeId === routeIn.routeId),
      routeTouched.tried.some(ar => ar.routeId === routeIn.routeId),
      routeTouched.trTicked.some(ar => ar.routeId === routeIn.routeId),
      routeIn.ascentType,
      route.routeTypeId,
    );
    if (!logPossible) {
      throw new HttpException('Impossible log', HttpStatus.NOT_ACCEPTABLE);
    }

    // If after the date of this log more logs of the same route exist, their ascent types might need to be changed (eg. redpoint -> repeat etc.)
    const args: [string, string, Date, QueryRunner, SideEffect[]] = [
      routeIn.routeId,
      user.id,
      activity.date,
      queryRunner,
      sideEffects,
    ];
    if (this.isTick(routeIn.ascentType)) {
      await this.convertFirstTickAfterToRepeat(...args);
      await this.convertFirstTrTickAfterToTrRepeat(...args);
      await this.convertFirstTrSightOrFlashAfterToTrRedpoint(...args);
    } else if (this.isTrTick(routeIn.ascentType)) {
      await this.convertFirstSightOrFlashAfterToRedpoint(...args);
      await this.convertFirstTrTickAfterToTrRepeat(...args);
    } else {
      // it is only a try
      // there can really only be one of the below, so one of theese will do nothing. and also could do it in a single query, but leave as is for readability reasons
      await this.convertFirstSightOrFlashAfterToRedpoint(...args);
      await this.convertFirstTrSightOrFlashAfterToTrRedpoint(...args);
    }

    activityRoute.route = Promise.resolve(route);

    // if a vote on difficulty is passed add a new difficulty vote or update existing
    if (routeIn.votedDifficulty) {
      // but first check if a user even can vote (can vote only if the log is a tick)
      if (!this.isTick(routeIn.ascentType)) {
        throw new HttpException(
          'Cannot vote on difficulty if not logging a tick.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      let difficultyVote = await queryRunner.manager.findOne(DifficultyVote, {
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

    // if a vote on star rating (route beauty) is passed add a new star rating vote or update existing one
    if (routeIn.votedStarRating || routeIn.votedStarRating === 0) {
      // but first check if a user even can vote (can vote only if the log is a tick)
      if (!this.isTick(routeIn.ascentType)) {
        throw new HttpException(
          'Cannot vote on star rating (beauty) if not logging a tick.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      let starRatingVote = await queryRunner.manager.findOne(StarRatingVote, {
        user,
        route,
      });
      if (!starRatingVote) {
        starRatingVote = new StarRatingVote();
        starRatingVote.route = Promise.resolve(route);
        starRatingVote.user = Promise.resolve(user);
      }
      starRatingVote.stars = routeIn.votedStarRating;

      await queryRunner.manager.save(starRatingVote);
    }

    // Deprecated: unnecessary if statement -> activity should not be null anymore ?? // TODO: make final decision on this!
    if (activity !== null) {
      activityRoute.activity = Promise.resolve(activity);
    }

    return queryRunner.manager.save(activityRoute);
  }

  private isTick(ascentType: AscentType) {
    return tickAscentTypes.has(ascentType);
  }

  private isTrTick(ascentType: AscentType) {
    return trTickAscentTypes.has(ascentType);
  }

  /**
   * Find user's first tick of a route after the date and convert it to repeat if one exists
   */
  private async convertFirstTickAfterToRepeat(
    routeId: string,
    userId: string,
    date: Date,
    queryRunner: QueryRunner,
    sideEffects: SideEffect[] = [],
  ) {
    const futureTick = await queryRunner.manager
      .createQueryBuilder(ActivityRoute, 'ar')
      .where('ar."routeId" = :routeId', { routeId: routeId })
      .andWhere('ar."userId" = :userId', { userId: userId })
      .andWhere('ar."ascentType" IN (:...aTypes)', {
        aTypes: [...firstTickAscentTypes],
      })
      .andWhere('ar.date > :arDate', { arDate: date })
      .orderBy('ar.date', 'ASC') // not realy neccesary, but just in case
      .getOne(); // If data is valid there can only be one such ascent logged (or none)

    // We do have a tick in the future
    if (futureTick) {
      // Remember current activity route state
      const futureTickBeforeChange = new ActivityRoute();
      queryRunner.manager.merge(
        ActivityRoute,
        futureTickBeforeChange,
        futureTick,
      );

      // Convert it to repeat
      futureTick.ascentType = AscentType.REPEAT;
      await queryRunner.manager.save(futureTick);
      sideEffects.push({ before: futureTickBeforeChange, after: futureTick });
    }
  }

  /**
   * Find user's first toprope tick of a route after the date and convert it to toprope repeat if one exists
   */
  private async convertFirstTrTickAfterToTrRepeat(
    routeId: string,
    userId: string,
    date: Date,
    queryRunner: QueryRunner,
    sideEffects: SideEffect[] = [],
  ) {
    const futureTrTick = await queryRunner.manager
      .createQueryBuilder(ActivityRoute, 'ar')
      .where('ar."routeId" = :routeId', { routeId: routeId })
      .andWhere('ar."userId" = :userId', { userId: userId })
      .andWhere('ar."ascentType" IN (:...aTypes)', {
        aTypes: [...firstTrTickAscentTypes],
      })
      .andWhere('ar.date > :arDate', { arDate: date })
      .getOne(); // If data is valid there can only be one such ascent logged (or none)

    // We do have a toprope tick in the future
    if (futureTrTick) {
      // Remember current activity route state
      const futureTrTickBeforeChange = new ActivityRoute();
      queryRunner.manager.merge(
        ActivityRoute,
        futureTrTickBeforeChange,
        futureTrTick,
      );

      // Convert it to toprope repeat
      futureTrTick.ascentType = AscentType.T_REPEAT;
      await queryRunner.manager.save(futureTrTick);
      sideEffects.push({
        before: futureTrTickBeforeChange,
        after: futureTrTick,
      });
    }
  }

  /**
   * Find user's first onsight or flash of a route after the date and convert it to redpoint if one exists
   */
  private async convertFirstSightOrFlashAfterToRedpoint(
    routeId: string,
    userId: string,
    date: Date,
    queryRunner: QueryRunner,
    sideEffects: SideEffect[] = [],
  ) {
    const futureSightOrFlash = await queryRunner.manager
      .createQueryBuilder(ActivityRoute, 'ar')
      .where('ar."routeId" = :routeId', { routeId: routeId })
      .andWhere('ar."userId" = :userId', { userId: userId })
      .andWhere('ar."ascentType" IN (:...aTypes)', {
        aTypes: [AscentType.ONSIGHT, AscentType.FLASH],
      })
      .andWhere('ar.date > :arDate', { arDate: date })
      .getOne(); // If data is valid there can only be one such ascent logged (or none)

    // We do have a flash/onsight in the future
    if (futureSightOrFlash) {
      // Remember current activity route state
      const futureSightOrFlashBeforeChange = new ActivityRoute();
      queryRunner.manager.merge(
        ActivityRoute,
        futureSightOrFlashBeforeChange,
        futureSightOrFlash,
      );

      // Convert it to redpoint
      futureSightOrFlash.ascentType = AscentType.REDPOINT;
      await queryRunner.manager.save(futureSightOrFlash);
      sideEffects.push({
        before: futureSightOrFlashBeforeChange,
        after: futureSightOrFlash,
      });
    }
  }

  /**
   * Find user's first toprope onsight or toprope flash of a route after the date and convert it to toprope redpoint if one exists
   */
  private async convertFirstTrSightOrFlashAfterToTrRedpoint(
    routeId: string,
    userId: string,
    date: Date,
    queryRunner: QueryRunner,
    sideEffects: SideEffect[] = [],
  ) {
    const futureTrSightOrFlash = await queryRunner.manager
      .createQueryBuilder(ActivityRoute, 'ar')
      .where('ar."routeId" = :routeId', { routeId: routeId })
      .andWhere('ar."userId" = :userId', { userId: userId })
      .andWhere('ar."ascentType" IN (:...aTypes)', {
        aTypes: [AscentType.T_ONSIGHT, AscentType.T_FLASH],
      })
      .andWhere('ar.date > :arDate', { arDate: date })
      .getOne(); // If data is valid there can only be one such ascent logged (or none)

    // We do have a toprope flash/onsight in the future
    if (futureTrSightOrFlash) {
      // Remember current activity route state
      const futureTrSightOrFlashBeforeChange = new ActivityRoute();
      queryRunner.manager.merge(
        ActivityRoute,
        futureTrSightOrFlashBeforeChange,
        futureTrSightOrFlash,
      );

      // Convert it to toprope redpoint
      futureTrSightOrFlash.ascentType = AscentType.T_REDPOINT;
      await queryRunner.manager.save(futureTrSightOrFlash);
      sideEffects.push({
        before: futureTrSightOrFlashBeforeChange,
        after: futureTrSightOrFlash,
      });
    }
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
    routeTrTicked: boolean,
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

    // routes one already 'ticked' on toprope cannot be tr redpointed
    if (routeTrTicked) {
      if (ascentType === AscentType.T_REDPOINT) {
        return false;
      }
    }

    // routes not ticked before cannot be repeated
    if (ascentType === AscentType.REPEAT && !routeTicked) {
      return false;
    }

    // routes not ticked (real or tr) before cannot be toprope repeated
    if (ascentType === AscentType.T_REPEAT && !(routeTicked || routeTrTicked)) {
      return false;
    }

    return true;
  }

  // Deprecated, use getTouchesForRoutes instead
  async routeTouched(user: User, routeId: string) {
    const connection = getConnection();

    const query = connection
      .createQueryBuilder()
      .select('tried')
      .addSelect('ticked')
      .addSelect('trticked')
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
      .addFrom(subQuery => {
        return subQuery
          .select('count(*) > 0', 'trticked')
          .from('activity_route', 'ar')
          .where('ar.routeId = :routeId', { routeId: routeId })
          .andWhere('ar.userId = :userId', { userId: user.id })
          .andWhere('ar.ascentType IN (:...aTypes2)', {
            aTypes2: [...trTickAscentTypes],
          });
      }, 'trticked')
      .getRawMany();

    const result = await query;

    return result[0];
  }

  /**
   * For an array of route ids check which routes has a user already tried, ticked or ticked on toprope before (or on) a given date
   * (Pass in a queryRunner instance if you are inside a transaction)
   */
  async getTouchesForRoutes(
    input: FindRoutesTouchesInput,
    queryRunner: QueryRunner = null,
  ): Promise<RoutesTouches> {
    // Use queryRunner if in a transaction. otherwise get repository as ususal
    const qb =
      queryRunner?.manager.createQueryBuilder(ActivityRoute, 'ar') ??
      this.activityRoutesRepository.createQueryBuilder('ar');

    // This will be done in 3 queries for better readability (also :D)
    // might optimize to do it in a single query if needed later

    // Which of the passed routes have been ticked before (or on) the passed date?
    const ticked = await qb
      .addSelect('"routeId"') // need to add column to get the correct distinct
      .distinctOn(['ar.routeId'])
      .orderBy('ar.routeId')
      .addOrderBy('ar.ascentType')
      .where('ar.userId = :userId', { userId: input.userId })
      .andWhere('ar.routeId in (:...routeIds)', { routeIds: input.routeIds })
      .andWhere('ar.ascentType in (:...tickTypes)', {
        tickTypes: [...tickAscentTypes],
      })
      .andWhere('ar.date <= :before', { before: input.before })
      .getMany();

    // Which of the passed routes have been ticked on top rope before (or on) the passed date?
    const trTicked = await this.activityRoutesRepository
      .createQueryBuilder('ar')
      .addSelect('"routeId"') // need to add column to get the correct distinct
      .distinctOn(['ar.routeId'])
      .orderBy('ar.routeId')
      .addOrderBy('ar.ascentType')
      .where('ar.userId = :userId', { userId: input.userId })
      .andWhere('ar.routeId in (:...routeIds)', { routeIds: input.routeIds })
      .andWhere('ar.ascentType in (:...trTickTypes)', {
        trTickTypes: [...trTickAscentTypes],
      })
      .andWhere('ar.date <= :before', { before: input.before })
      .getMany();

    // Which of the passed routes have been tried before (or on) the passed date?
    const tried = await this.activityRoutesRepository
      .createQueryBuilder('ar')
      .addSelect('"routeId"') // need to add column to get the correct distinct
      .distinctOn(['ar.routeId'])
      .orderBy('ar.routeId')
      .addOrderBy('ar.ascentType')
      .where('ar.userId = :userId', { userId: input.userId })
      .andWhere('ar.routeId in (:...routeIds)', { routeIds: input.routeIds })
      .andWhere('ar.date <= :before', { before: input.before })
      .getMany();

    return {
      ticked,
      trTicked,
      tried,
    };
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
      builder.innerJoin('route', 'route', 'ar."routeId" = route.id');
      builder.andWhere('route."cragId" = :cragId', {
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
        status: ClubMemberStatus.ACTIVE,
      },
    });
    if (!clubMember) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    const query = this.buildQuery(params);
    query
      .leftJoinAndSelect('ar.user', 'user')
      .leftJoinAndSelect('user.clubs', 'clubMember')
      .leftJoinAndSelect('clubMember.club', 'club')
      .andWhere('"club"."id" = :clubId', { clubId: club.id })
      .andWhere('clubMember.status = :status', {
        status: ClubMemberStatus.ACTIVE,
      });

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

  async latestTicks(
    minStatus: CragStatus,
    latestN: number = null,
    inLastNDays: number = null,
  ): Promise<ActivityRoute[]> {
    const builder = this.activityRoutesRepository.createQueryBuilder('ar');

    // Build query that returns (only 'best' -> see comment bellow) 'new tick' ascent(s) of a user per day
    builder
      .addSelect('DATE(ar.date) AS ardate')
      .addSelect(
        "(r.difficulty + (ar.ascentType='onsight')::int * 100 + (ar.ascentType='flash')::int * 50) as score",
      )
      .innerJoin('route', 'r', 'ar.routeId = r.id')
      .innerJoin('crag', 'c', 'r.cragId = c.id')
      // .distinctOn(['ardate', 'ar.userId']) // use this if you want to return only one (best) ascent per user per day
      .where('ar.ascentType IN (:...aTypes)', {
        aTypes: firstTickAscentTypes,
      })
      .andWhere('ar.publish IN (:...publish)', {
        publish: ['log', 'public'], // public is public, log is 'javno na mojem profilu'
      })
      .andWhere('ar.routeId IS NOT NULL') // TODO: what are activity routes with no route id??
      .andWhere('r.difficulty IS NOT NULL') // TODO: entries with null values for grade? -> multipitch? - skip for now
      .andWhere('c.status <= :minStatus', { minStatus }) // hide ticks from hidden crags if dictated so by crag status
      .orderBy('ardate', 'DESC')
      .addOrderBy('ar.userId', 'DESC')
      .addOrderBy('score', 'DESC')
      .addOrderBy('ar.ascentType', 'ASC');

    if (inLastNDays) {
      builder.andWhere(
        `ar.date > current_date - interval '${inLastNDays}' day`,
      );
    }
    if (latestN) {
      builder.limit(latestN);
    }

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

    builder.innerJoin('route', 'r', 'r.id = ar."routeId"');
    builder.addSelect('r.difficulty');

    builder.leftJoin('pitch', 'p', 'p.id = ar."pitchId"');
    builder.addSelect('p.difficulty');
    builder.addSelect('coalesce(p.difficulty, r.difficulty)', 'difficulty');

    if (params.orderBy != null) {
      builder.orderBy(
        this.orderByField(params.orderBy.field),
        params.orderBy.direction || 'DESC',
      );

      builder.addOrderBy(
        'ar.position',
        params.orderBy.field === 'date' ? params.orderBy.direction : 'DESC',
      );
    } else {
      builder.orderBy('ar.created', 'DESC').addOrderBy('ar.position', 'DESC');
    }

    if (params.cragId != null) {
      builder.innerJoin('route', 'route', 'ar."routeId" = route.id');
      builder.andWhere('route."cragId" = :cragId', {
        cragId: params.cragId,
      });
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

    if (params.activityId != null) {
      builder.andWhere('ar."activityId" = :activityId', {
        activityId: params.activityId,
      });
    }

    return builder;
  }

  private orderByField(field: string) {
    if (field == null) {
      return 'ar.created';
    }

    if (field == 'grade') {
      return 'difficulty';
    }

    return `ar.${field}`;
  }

  findOneById(id: string): Promise<ActivityRoute> {
    return this.activityRoutesRepository.findOneOrFail(id);
  }

  async update(data: UpdateActivityRouteInput): Promise<ActivityRoute> {
    const activityRoute = await this.activityRoutesRepository.findOneOrFail(
      data.id,
    );

    this.activityRoutesRepository.merge(activityRoute, data);

    return this.activityRoutesRepository.save(activityRoute);
  }

  async delete(activityRoute: ActivityRoute): Promise<boolean> {
    return this.activityRoutesRepository.remove(activityRoute).then(() => true);
  }
}
