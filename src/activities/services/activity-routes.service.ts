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
  DataSource,
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
} from '../entities/activity-route.entity';
import { Activity } from '../entities/activity.entity';
import { PaginatedActivityRoutes } from '../utils/paginated-activity-routes.class';
import { DifficultyVote } from '../../crags/entities/difficulty-vote.entity';
import { StarRatingVote } from '../../crags/entities/star-rating-vote.entity';
import { UpdateActivityRouteInput } from '../dtos/update-activity-route.input';
import { RoutesTouches } from '../utils/routes-touches.class';
import { FindRoutesTouchesInput } from '../dtos/find-routes-touches.input';
import { SideEffect } from '../utils/side-effect.class';
import { setBuilderCache } from '../../core/utils/entity-cache/entity-cache-helpers';
import {
  convertFirstSightOrFlashAfterToRedpoint,
  convertFirstTickAfterToRepeat,
  convertFirstTrSightOrFlashAfterToTrRedpoint,
  convertFirstTrTickAfterToTrRepeat,
  isTick,
  isTrTick,
} from '../../crags/utils/convert-ascents';
import {
  calculateScore,
  recalculateActivityRoutesScores,
} from '../../crags/utils/calculate-scores';
import { StatsActivities } from '../utils/stats-activities.class';

@Injectable()
export class ActivityRoutesService {
  constructor(
    private dataSource: DataSource,
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
    const queryRunner = this.dataSource.createQueryRunner();
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

    let route = await queryRunner.manager.findOneByOrFail(Route, {
      id: routeIn.routeId,
    });

    const routeTouched = await this.getTouchesForRoutes(
      new FindRoutesTouchesInput([routeIn.routeId], routeIn.date),
      user.id,
      queryRunner,
    );
    const logPossible = this.logPossible(
      routeTouched.ticked.some((ar) => ar.routeId === routeIn.routeId),
      routeTouched.tried.some((ar) => ar.routeId === routeIn.routeId),
      routeTouched.trTicked.some((ar) => ar.routeId === routeIn.routeId),
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
    if (isTick(routeIn.ascentType)) {
      await convertFirstTickAfterToRepeat(...args);
      await convertFirstTrTickAfterToTrRepeat(...args);
      await convertFirstTrSightOrFlashAfterToTrRedpoint(...args);
    } else if (isTrTick(routeIn.ascentType)) {
      await convertFirstSightOrFlashAfterToRedpoint(...args);
      await convertFirstTrTickAfterToTrRepeat(...args);
    } else {
      // it is only a try
      // there can really only be one of the below, so one of theese will do nothing. and also could do it in a single query, but leave as is for readability reasons
      await convertFirstSightOrFlashAfterToRedpoint(...args);
      await convertFirstTrSightOrFlashAfterToTrRedpoint(...args);
    }

    activityRoute.route = Promise.resolve(route);

    if (
      route.isProject &&
      isTick(routeIn.ascentType) &&
      !routeIn.votedDifficulty
    ) {
      throw new HttpException(
        'If ticking a project difficulty vote is required.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    // if a vote on difficulty is passed add a new difficulty vote or update existing
    if (routeIn.votedDifficulty) {
      // but first check if a user even can vote (can vote only if the log is a tick)
      if (!isTick(routeIn.ascentType)) {
        throw new HttpException(
          'Cannot vote on difficulty if not logging a tick.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      let difficultyVote = await queryRunner.manager.findOneBy(DifficultyVote, {
        userId: user.id,
        routeId: route.id,
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

    // recalculate all orderScore and rankingScore fields for all other activity routes of this route
    await recalculateActivityRoutesScores(routeIn.routeId, queryRunner);
    // await this.recalculateActivityRoutesScores(routeIn.routeId, queryRunner);
    // TODO: above recalculation should be placed into queue rather than done synchronously here

    // TODO: after above recalc is moved into q this will not be neccessary because recalc will happen after this transaction (and will include this ar)
    // but for now we need refetch the route of the current activity route because the trigger might have changed the difficulty
    route = await queryRunner.manager.findOneBy(Route, {
      id: routeIn.routeId,
    });
    activityRoute.orderScore = calculateScore(
      route.difficulty,
      activityRoute.ascentType,
      'order',
    );
    activityRoute.rankingScore = calculateScore(
      route.difficulty,
      activityRoute.ascentType,
      'ranking',
    );

    // if a vote on star rating (route beauty) is passed add a new star rating vote or update existing one
    if (routeIn.votedStarRating || routeIn.votedStarRating === 0) {
      let starRatingVote = await queryRunner.manager.findOneBy(StarRatingVote, {
        userId: user.id,
        routeId: route.id,
      });

      if (!starRatingVote) {
        starRatingVote = new StarRatingVote();
        starRatingVote.route = Promise.resolve(route);
        starRatingVote.user = Promise.resolve(user);
      }
      starRatingVote.stars = routeIn.votedStarRating;

      await queryRunner.manager.save(starRatingVote);

      // Recalculate the average star rating for the route and count the number of star ratings for the route and save it to the route table
      await this.recalculateStarRating(route, queryRunner);
    }

    // Deprecated: unnecessary if statement -> activity should not be null anymore ?? // TODO: make final decision on this!
    if (activity !== null) {
      activityRoute.activity = Promise.resolve(activity);
    }

    return queryRunner.manager.save(activityRoute);
  }

  /**
   * check if logging a route is even possible
   * e.g. onsighting a route already tried is impossible and so on
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

  /**
   * For an array of route ids check which of the routes has a user already tried, ticked or ticked on toprope before (or on) a given date
   * (Pass in a queryRunner instance if you are inside a transaction)
   */
  async getTouchesForRoutes(
    input: FindRoutesTouchesInput,
    userId: string,
    queryRunner: QueryRunner = null,
  ): Promise<RoutesTouches> {
    // Use queryRunner if in a transaction. otherwise get qb from repository as ususal
    const qb =
      queryRunner?.manager.createQueryBuilder(ActivityRoute, 'ar') ??
      this.activityRoutesRepository.createQueryBuilder('ar');

    // This will be done in 3 queries for better readability (also :D)
    // might optimize to do it in a single query if needed later

    // Which of the passed routes have been ticked before (or on) the passed date?
    const ticked = await qb
      .addSelect('route_id') // need to add column to get the correct distinct
      .distinctOn(['ar.route_id'])
      .orderBy('ar.route_id')
      .addOrderBy('ar.ascent_type')
      .where('ar.user_id = :userId', { userId })
      .andWhere('ar.route_id in (:...routeIds)', { routeIds: input.routeIds })
      .andWhere('ar.ascent_type in (:...tickTypes)', {
        tickTypes: [...tickAscentTypes],
      })
      .andWhere('ar.date <= :before', { before: input.before })
      .getMany();

    // Which of the passed routes have been ticked on top rope before (or on) the passed date?
    const trTicked = await qb
      .addSelect('route_id') // need to add column to get the correct distinct
      .distinctOn(['ar.route_id'])
      .orderBy('ar.route_id')
      .addOrderBy('ar.ascent_type')
      .where('ar.user_id = :userId', { userId })
      .andWhere('ar.route_id in (:...routeIds)', { routeIds: input.routeIds })
      .andWhere('ar.ascent_type in (:...trTickTypes)', {
        trTickTypes: [...trTickAscentTypes],
      })
      .andWhere('ar.date <= :before', { before: input.before })
      .getMany();

    // Which of the passed routes have been tried before (or on) the passed date?
    const tried = await qb
      .addSelect('route_id') // need to add column to get the correct distinct
      .distinctOn(['ar.route_id'])
      .orderBy('ar.route_id')
      .addOrderBy('ar.ascent_type')
      .where('ar.user_id = :userId', { userId })
      .andWhere('ar.route_id in (:...routeIds)', { routeIds: input.routeIds })
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

    builder.distinctOn(['ar.route_id']);
    builder.orderBy('ar.route_id');
    builder.addOrderBy('ar.ascent_type'); // note: ascentType is an enum ordered by most valued ascent type (ie onsight) toward least valued (ie t_attempt)

    if (params.userId != null) {
      builder.andWhere('ar.user_id = :userId', {
        userId: params.userId,
      });
    }

    if (params.cragId != null) {
      builder.innerJoin('route', 'route', 'ar.route_id = route.id');
      builder.andWhere('route.crag_id = :cragId', {
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
        userId: user.id,
        clubId: club.id,
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
    // enforce publish limitations (regardles of what the input is requesting, max what the user can see through here is club and public ascents)
    query.andWhere('ar.publish IN (:...publish)', {
      publish: ['log', 'public', 'club'],
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
    showHiddenCrags: boolean,
    latestN: number = null,
    inLastNDays: number = null,
  ): Promise<ActivityRoute[]> {
    const builder = this.activityRoutesRepository.createQueryBuilder('ar');

    // Build query that returns (only 'best' -> see comment bellow) 'new tick' ascent(s) of a user per day
    builder
      .addSelect('DATE(ar.date) AS ardate')
      .addSelect(
        "(r.difficulty + (ar.ascent_type='onsight')::int * 100 + (ar.ascent_type='flash')::int * 50) as score",
      )
      .innerJoin('route', 'r', 'ar.route_id = r.id')
      .innerJoin('crag', 'c', 'r.cragId = c.id')
      // .distinctOn(['ardate', 'ar.userId']) // use this if you want to return only one (best) ascent per user per day
      .where('ar.ascent_type IN (:...aTypes)', {
        aTypes: [...firstTickAscentTypes],
      })
      .andWhere('ar.publish IN (:...publish)', {
        publish: ['log', 'public'], // public is public, log is 'javno na mojem profilu'
      })
      .andWhere('ar.route_id IS NOT NULL') // TODO: what are activity routes with no route id??
      .andWhere('r.difficulty IS NOT NULL') // TODO: entries with null values for grade? -> multipitch? - skip for now
      .andWhere("r.publish_status = 'published'") // only show ticks for published routes
      .orderBy('ardate', 'DESC')
      .addOrderBy('ar.user_id', 'DESC')
      .addOrderBy('score', 'DESC')
      .addOrderBy('ar.ascent_type', 'ASC');

    if (!showHiddenCrags) {
      builder.andWhere('c.is_hidden = false'); // don't show hidden crags
    }

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
    currentUser: User = null,
  ): Promise<PaginatedActivityRoutes> {
    const query = this.buildQuery(params, currentUser);
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

  async getStats(
    params: FindActivityRoutesInput = {},
    currentUser: User = null,
  ): Promise<StatsActivities[]> {
    const builder = this.activityRoutesRepository
      .createQueryBuilder('ar')
      .select('EXTRACT(YEAR FROM ar.date)', 'year')
      .addSelect('coalesce(p.difficulty, r.difficulty)', 'difficulty')
      .addSelect('ar.ascent_type', 'ascent_type')
      .addSelect('count(ar.id)', 'nr_ascents')
      .addSelect('count(r.id)', 'nr_routes')
      .addSelect('count(p.id)', 'nr_pitches')
      .innerJoin('route', 'r', 'r.id = ar.route_id')
      .leftJoin('pitch', 'p', 'p.id = ar.pitch_id')
      .where('ar.user_id = :userId', {
        userId: currentUser.id,
      })
      .andWhere('ar.ascent_type IN (:...ascentType)', {
        ascentType: ['onsight', 'redpoint', 'flash'],
      })
      .andWhere(
        "(r.publish_status IN ('published', 'in_review') OR (r.publish_status = 'draft' AND ar.user_id = :userId))",
        { userId: currentUser.id },
      )
      .andWhere('coalesce(p.difficulty, r.difficulty) is not null')
      .groupBy('p.difficulty')
      .addGroupBy('r.difficulty')
      .addGroupBy('EXTRACT(YEAR FROM ar.date)')
      .addGroupBy('ar.ascent_type')
      .orderBy('coalesce(p.difficulty, r.difficulty)', 'ASC')
      .addOrderBy('year', 'ASC');

    if (params.routeTypes != null) {
      builder.andWhere('r.route_type_id IN(:...routeTypes)', {
        routeTypes: params.routeTypes,
      });
    }

    setBuilderCache(builder, 'getRawAndEntities');

    const raw = await builder.getRawMany();
    const myStats = raw.map((element, index) => {
      return {
        year: element.year,
        difficulty: element.difficulty,
        ascent_type: element.ascent_type,
        nr_routes: element.nr_routes,
      };
    });
    return myStats;
  }

  async find(
    params: FindActivityRoutesInput = {},
    currentUser: User = null,
  ): Promise<ActivityRoute[]> {
    const query = this.buildQuery(params, currentUser);
    setBuilderCache(query);
    return query.getMany();
  }

  private buildQuery(
    params: FindActivityRoutesInput = {},
    currentUser: User = null,
  ): SelectQueryBuilder<ActivityRoute> {
    const builder = this.activityRoutesRepository.createQueryBuilder('ar');

    builder.innerJoin('route', 'r', 'r.id = ar.route_id');
    builder.addSelect('r.difficulty');

    builder.leftJoin('pitch', 'p', 'p.id = ar.pitch_id');
    builder.addSelect('p.difficulty');
    builder.addSelect('coalesce(p.difficulty, r.difficulty)', 'difficulty');

    if (params.orderBy != null) {
      builder.orderBy(
        this.orderByField(params.orderBy.field),
        params.orderBy.direction || 'DESC',
      );

      if (params.orderBy.field == 'grade') {
        builder.addOrderBy('ar.orderScore', params.orderBy.direction || 'DESC');
      }

      if (params.orderBy.field != 'position') {
        builder.addOrderBy(
          'ar.position',
          params.orderBy.field === 'date' ? params.orderBy.direction : 'DESC',
        );
      }
    } else {
      builder.orderBy('ar.created', 'DESC').addOrderBy('ar.position', 'DESC');
    }

    if (params.cragId != null) {
      builder.innerJoin('route', 'route', 'ar.route_id = route.id');
      builder.andWhere('route.crag_id = :cragId', {
        cragId: params.cragId,
      });
    }

    // TODO: should we rename this to forUserId?
    if (params.userId != null) {
      builder.andWhere('ar.user_id = :userId', {
        userId: params.userId,
      });
    }

    if (params.ascentType != null) {
      builder.andWhere('ar.ascent_type IN (:...ascentType)', {
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
      builder.andWhere('ar.route_id = :routeId', { routeId: params.routeId });
    }

    if (params.activityId != null) {
      builder.andWhere('ar.activity_id = :activityId', {
        activityId: params.activityId,
      });
    }

    // If no current user is passed in, that means we are serving a guest
    if (!currentUser) {
      // Allow showing only public ascents to guests
      builder.andWhere('ar."publish" IN (:...publish)', {
        publish: ['log', 'public'],
      });

      // Allow showing only published routes (no drafts or in_reviews)
      builder.andWhere("r.publish_status = 'published'");
    } else {
      // Allow showing users own ascents and all public ascents
      builder.andWhere(
        '(ar.user_id = :userId OR ar."publish" IN (:...publish))',
        {
          userId: currentUser.id,
          publish: ['log', 'public'],
        },
      );
      // TODO: should also allow showing club ascents

      if (currentUser.isAdmin()) {
        // Allow showing only published and in_review routes and also own drafts
        builder.andWhere(
          "(r.publish_status IN ('published', 'in_review') OR (r.publish_status = 'draft' AND ar.user_id = :userId))",
          { userId: currentUser.id },
        );
      } else {
        // Allow showing only published routes and also own drafts and in_reviews
        builder.andWhere(
          "(r.publish_status = 'published' OR (r.publish_status IN ('draft', 'in_review') AND ar.user_id = :userId))",
          { userId: currentUser.id },
        );
      }
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
    return this.activityRoutesRepository.findOneByOrFail({ id });
  }

  async update(data: UpdateActivityRouteInput): Promise<ActivityRoute> {
    const activityRoute = await this.activityRoutesRepository.findOneByOrFail({
      id: data.id,
    });

    this.activityRoutesRepository.merge(activityRoute, data);

    return this.activityRoutesRepository.save(activityRoute);
  }

  async delete(
    activityRoute: ActivityRoute,
    queryRunner: QueryRunner,
  ): Promise<boolean> {
    await queryRunner.manager.remove(ActivityRoute, activityRoute);

    // // If this was the last ascent of this route for this user, we should also delete the possible starRating vote and recalculate starRating for the route
    const nrAscentsLeft = await queryRunner.manager
      .createQueryBuilder(ActivityRoute, 'ar')
      .select('count(*)')
      .where('ar.route_id = :routeId', { routeId: activityRoute.routeId })
      .andWhere('ar.user_id = :userId', { userId: activityRoute.userId })
      .getRawOne();

    if (nrAscentsLeft.count == 0) {
      const starRatingVote = await queryRunner.manager.findOneBy(
        StarRatingVote,
        {
          userId: activityRoute.userId,
          routeId: activityRoute.routeId,
        },
      );

      // If the user even has cast a star ratig vote for this route
      if (starRatingVote) {
        await queryRunner.manager.remove(StarRatingVote, starRatingVote);

        const route = await queryRunner.manager.findOneBy(Route, {
          id: activityRoute.routeId,
        });
        await this.recalculateStarRating(route, queryRunner);
      }
    }

    // after the activity route has been removed, the difficulty vote also might have been removed by a trigger.
    // if so, then the calculated difficulty might have changed, which in turn changes the scores fields of the activity route
    // that means that we need to recalculate all orderScore and rankingScore fields for this and all other activity routes of this route
    await recalculateActivityRoutesScores(activityRoute.routeId, queryRunner);
    // TODO: move calculation to queue

    return true;
  }

  /**
   * Recalculate the star rating for a route based on conditions explained below
   */
  private async recalculateStarRating(route: Route, queryRunner: QueryRunner) {
    const minNumOfVotes = 5;
    const majorityThreshold = 0.5;

    /*
     * There are 3 conditions for a route to actually get a star rating:
     * 1. The route needs to have some minimum total number of votes (3)
     * 2. One of the star options (0, 1 or 2) needs to have more then some predefined majority within all the votes (50%)
     * 3. The rounded average of the stars given needs to be the same as the majority star option. (this prevents from averaging out the star rating and instead shows any stars only when there is an actual consensus on the star rating)
     */

    const starRatingVoteCounts = await queryRunner.manager
      .createQueryBuilder(StarRatingVote, 'srv')
      .select(['count(srv.stars) as count', 'srv.stars as stars'])
      .where('srv.route_id = :routeId', { routeId: route.id })
      .groupBy('stars')
      .getRawMany();

    let nrAllVotes = 0; // the number of all star rating votes for the route
    let starsSum = 0; // sum of values of all stars (used to calculate the average)
    let mostVotedStar = null; // kind of star that received the most votes. 0, 1 or 2
    let nrVotesForMostVotedStar = 0; // how many votes do we have for the most voted star

    for (const voteCount of starRatingVoteCounts) {
      nrAllVotes += +voteCount['count'];
      starsSum += +voteCount['stars'] * +voteCount['count'];

      if (
        mostVotedStar == null ||
        +voteCount['count'] > nrVotesForMostVotedStar
      ) {
        nrVotesForMostVotedStar = +voteCount['count'];
        mostVotedStar = +voteCount['stars'];
      }
    }

    if (
      nrAllVotes < minNumOfVotes ||
      nrVotesForMostVotedStar / nrAllVotes < majorityThreshold ||
      Math.round(starsSum / nrAllVotes) != mostVotedStar
    ) {
      route.starRating = null;
    } else {
      route.starRating = mostVotedStar;
    }

    await queryRunner.manager.update(Route, route.id, {
      starRating: route.starRating,
    });
  }
}
