import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Route } from '../entities/route.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Sector } from '../entities/sector.entity';
import {
  DataSource,
  In,
  MoreThanOrEqual,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CreateRouteInput } from '../dtos/create-route.input';
import { UpdateRouteInput } from '../dtos/update-route.input';
import slugify from 'slugify';
import { DifficultyVote } from '../entities/difficulty-vote.entity';
import { User } from '../../users/entities/user.entity';
import { FindRoutesServiceInput } from '../dtos/find-routes-service.input';
import {
  ActivityRoute,
  tickAscentTypes,
} from '../../activities/entities/activity-route.entity';
import { Transaction } from '../../core/utils/transaction.class';
import {
  getPublishStatusParams,
  setPublishStatusParams,
  updateUserContributionsFlag,
} from '../../core/utils/contributable-helpers';
import { setBuilderCache } from '../../core/utils/entity-cache/entity-cache-helpers';
import { mergeRoutes } from '../utils/merge-routes';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    protected routesRepository: Repository<Route>,
    @InjectRepository(Sector)
    protected sectorsRepository: Repository<Sector>,
    @InjectRepository(ActivityRoute)
    protected activityRoutesRepository: Repository<ActivityRoute>,
    private dataSource: DataSource,
  ) {}

  async find(input: FindRoutesServiceInput): Promise<Route[]> {
    return (await this.buildQuery(input)).getMany();
  }

  async findOne(input: FindRoutesServiceInput): Promise<Route> {
    return (await this.buildQuery(input)).getOneOrFail();
  }

  async findByIds(ids: string[]): Promise<Route[]> {
    return this.routesRepository.findBy({ id: In(ids) });
  }

  async findOneById(id: string): Promise<Route> {
    return this.routesRepository.findOneByOrFail({ id });
  }

  async findOneBySlug(
    cragSlug: string,
    routeSlug: string,
    user: User,
  ): Promise<Route> {
    const builder = this.routesRepository.createQueryBuilder('r');

    builder
      .innerJoin('crag', 'c', 'c.id = r.crag_id')
      .where('r.slug = :routeSlug', { routeSlug: routeSlug })
      .andWhere('c.slug = :cragSlug', { cragSlug: cragSlug });

    const { conditions, params } = await getPublishStatusParams('r', user);
    builder.andWhere(conditions, params);

    if (!(user != null)) {
      builder.andWhere('c.is_hidden = false');
    }

    return builder.getOneOrFail();
  }

  countTicks(route: Route): Promise<number> {
    return this.activityRoutesRepository.count({
      where: {
        routeId: route.id,
        ascentType: In([...tickAscentTypes]),
      },
    });
  }

  countTries(route: Route): Promise<number> {
    return this.activityRoutesRepository.count({
      where: { routeId: route.id },
    });
  }

  async countDisctinctClimbers(route: Route): Promise<number> {
    const result = this.activityRoutesRepository
      .createQueryBuilder('ar')
      .select('COUNT(DISTINCT(ar.user_id)) as "nrClimbers"')
      .where('ar.route_id = :routeId', { routeId: route.id })
      .getRawOne();

    return parseInt((await result).nrClimbers);
  }

  async create(data: CreateRouteInput, user: User): Promise<Route> {
    const route = new Route();

    this.routesRepository.merge(route, data);

    route.user = Promise.resolve(user);

    const sector = await this.sectorsRepository.findOneByOrFail({
      id: data.sectorId,
    });

    route.sectorId = sector.id;
    route.cragId = sector.cragId;

    route.slug = await this.generateRouteSlug(route.name, route.cragId);

    const transaction = new Transaction(this.dataSource);
    await transaction.start();

    try {
      await transaction.save(route);
      await this.shiftFollowingRoutes(route, transaction);

      if (data.baseDifficulty != null && !route.isProject) {
        await this.createBaseDifficulty(
          route,
          data.baseDifficulty,
          transaction,
        );
      }
      await updateUserContributionsFlag(route.publishStatus, user, transaction);
    } catch (e) {
      await transaction.rollback();
      throw e;
    }

    await transaction.commit();

    return Promise.resolve(route);
  }

  async update(data: UpdateRouteInput): Promise<Route> {
    const transaction = new Transaction(this.dataSource);
    await transaction.start();
    let route = await transaction.queryRunner.manager.findOneByOrFail(Route, {
      id: data.id,
    });
    try {
      // Is the request trying to update the route base difficulty?
      if (
        (data.baseDifficulty != undefined &&
          data.baseDifficulty != route.difficulty) ||
        (data.isProject != undefined && data.isProject != route.isProject)
      ) {
        // First check that route has no difficulty votes yet (except for the base difficulty vote)
        if (await this.hasRealDifficultyVotes(route, transaction)) {
          throw new HttpException(
            'route_has_difficulty_votes',
            HttpStatus.CONFLICT,
          );
        }
        // Then check that the route hasn't been logged yet (this condition actually includes the no votes check, as a vote cannot be cast without an ascent, but keep it because of possible legacy data)
        if (await this.hasLogEntries(route, transaction)) {
          throw new HttpException('route_has_log_entries', HttpStatus.CONFLICT);
        }

        // Project and baseDifficulty mutually exclude each other
        const isProjectAfterUpdate = data.isProject ?? route.isProject;
        const baseDifficultyAfterUpdate =
          data.baseDifficulty === undefined
            ? route.difficulty
            : data.baseDifficulty;
        if (isProjectAfterUpdate && baseDifficultyAfterUpdate) {
          throw new HttpException(
            'should_not_pass_difficulty_for_a_project',
            HttpStatus.CONFLICT,
          );
        }
        if (!isProjectAfterUpdate && !baseDifficultyAfterUpdate) {
          throw new HttpException(
            'should_pass_difficulty_for_a_non-project',
            HttpStatus.CONFLICT,
          );
        }

        if (route.isProject && !isProjectAfterUpdate) {
          // Route was a project and now is not. Base difficulty should be received and base difficulty vote should be created.
          await this.createBaseDifficulty(
            route,
            data.baseDifficulty,
            transaction,
          );
        } else if (!route.isProject && isProjectAfterUpdate) {
          // Route was not a project and now is. Base difficulty should be deleted.
          await this.deleteBaseDifficulty(route, transaction);
        } else {
          await this.updateBaseDifficulty(
            route,
            data.baseDifficulty,
            transaction,
          );
        }

        // Refetch route, because trigger should have changed the calculated difficulty
        route = await transaction.queryRunner.manager.findOneByOrFail(Route, {
          id: data.id,
        });
      }

      transaction.queryRunner.manager.merge(Route, route, data);

      // TODO: this will always be true when posting from route popup in management. should probably update only if the name actually changed
      if (data.name != null) {
        route.slug = await this.generateRouteSlug(
          route.name,
          route.cragId,
          route.id,
        );
      }

      await transaction.save(route);
      await this.shiftFollowingRoutes(route, transaction);
      const user = await route.user;
      await updateUserContributionsFlag(route.publishStatus, user, transaction);
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
    await transaction.commit();

    return Promise.resolve(route);
  }

  private async shiftFollowingRoutes(route: Route, transaction: Transaction) {
    const followingRoutes = await transaction.queryRunner.manager.find(Route, {
      where: {
        sectorId: route.sectorId,
        position: MoreThanOrEqual(route.position),
        id: Not(route.id),
      },
      order: {
        position: 'ASC',
      },
    });

    if (
      followingRoutes.length > 0 &&
      followingRoutes[0].position == route.position
    ) {
      for (let offset = 0; offset < followingRoutes.length; offset++) {
        followingRoutes[offset].position = route.position + offset + 1;
        await transaction.save(followingRoutes[offset]);
      }
    }
  }

  async delete(id: string): Promise<boolean> {
    const route = await this.routesRepository.findOneByOrFail({ id });

    const transaction = new Transaction(this.dataSource);
    await transaction.start();

    try {
      const user = await route.user;
      await transaction.delete(route);
      await updateUserContributionsFlag(null, user, transaction);
    } catch (e) {
      await transaction.rollback();
      throw e;
    }

    await transaction.commit();

    return Promise.resolve(true);
  }

  private async createBaseDifficulty(
    route: Route,
    difficulty: number,
    transaction: Transaction,
  ): Promise<void> {
    const vote = new DifficultyVote();
    vote.route = Promise.resolve(route);
    vote.difficulty = difficulty;
    vote.isBase = true;

    return transaction.save(vote);
  }

  private async updateBaseDifficulty(
    route: Route,
    difficulty: number,
    transaction: Transaction,
  ): Promise<void> {
    const difficultyVote =
      await transaction.queryRunner.manager.findOneByOrFail(DifficultyVote, {
        routeId: route.id,
        isBase: true,
      });
    difficultyVote.difficulty = difficulty;
    return transaction.save(difficultyVote);
  }

  private async deleteBaseDifficulty(route: Route, transaction: Transaction) {
    const difficultyVote =
      await transaction.queryRunner.manager.findOneByOrFail(DifficultyVote, {
        routeId: route.id,
        isBase: true,
      });
    return transaction.delete(difficultyVote);
  }

  private async hasRealDifficultyVotes(route: Route, transaction: Transaction) {
    return (await transaction.queryRunner.manager.countBy(DifficultyVote, {
      routeId: route.id,
      isBase: false,
    }))
      ? true
      : false;
  }

  private async hasLogEntries(route: Route, transaction: Transaction) {
    return (await transaction.queryRunner.manager.countBy(ActivityRoute, {
      routeId: route.id,
    }))
      ? true
      : false;
  }

  private async buildQuery(
    params: FindRoutesServiceInput = {},
  ): Promise<SelectQueryBuilder<Route>> {
    const builder = this.routesRepository.createQueryBuilder('s');

    builder.orderBy('s.position', 'ASC');

    if (params.sectorId != null) {
      builder.andWhere('s.sector = :sectorId', {
        sectorId: params.sectorId,
      });
    }

    if (params.sectorIds != null) {
      builder.andWhere('s.sector IN (:...sectorIds)', {
        sectorIds: params.sectorIds,
      });
    }

    if (params.id != null) {
      builder.andWhere('s.id = :id', {
        id: params.id,
      });
    }

    await setPublishStatusParams(builder, 's', params);

    setBuilderCache(builder);

    return builder;
  }

  async moveToSector(
    route: Route,
    sector: Sector,
    mergeWithRoute?: Route,
    primaryRoute?: string,
  ): Promise<boolean> {
    const transaction = new Transaction(this.dataSource);
    await transaction.start();
    try {
      route.sectorId = sector.id;
      await transaction.save(route);

      if (mergeWithRoute != null) {
        await mergeRoutes(route, mergeWithRoute, primaryRoute, transaction);
      }
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
    transaction.commit();
    return true;
  }

  /**
   * @param sourceRoute the route that will be deleted after all related entities (votes, comments, ...) are transfered to the targetRoute
   * @param targetRoute the main route that will be kept and on to which all related entities will be transfered
   */
  async merge(sourceRoute: Route, targetRoute: Route): Promise<boolean> {
    const transaction = new Transaction(this.dataSource);
    await transaction.start();
    try {
      await mergeRoutes(sourceRoute, targetRoute, 'target', transaction);
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
    transaction.commit();
    return true;
  }

  private async generateRouteSlug(
    routeName: string,
    cragId: string,
    selfId?: string,
  ) {
    const selfCond = selfId != null ? { id: Not(selfId) } : {};
    let slug = slugify(routeName, { lower: true });
    let suffixCounter = 0;
    let suffix = '';

    while (
      (await this.routesRepository.count({
        where: { ...selfCond, slug: slug + suffix, cragId: cragId },
      })) > 0
    ) {
      suffixCounter++;
      suffix = '-' + suffixCounter;
    }
    slug += suffix;
    return slug;
  }
}
