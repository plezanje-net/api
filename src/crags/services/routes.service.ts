import { Injectable } from '@nestjs/common';
import { Route } from '../entities/route.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Sector } from '../entities/sector.entity';
import {
  Connection,
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
import { ContributablesService } from './contributables.service';
import { tickAscentTypes } from '../../activities/entities/activity-route.entity';
import { Transaction } from '../../core/utils/transaction.class';
import { Crag } from '../entities/crag.entity';

@Injectable()
export class RoutesService extends ContributablesService {
  constructor(
    @InjectRepository(Route)
    protected routesRepository: Repository<Route>,
    @InjectRepository(Sector)
    protected sectorsRepository: Repository<Sector>,
    @InjectRepository(Crag)
    protected cragRepository: Repository<Crag>,
    @InjectRepository(DifficultyVote)
    private difficultyVoteRepository: Repository<DifficultyVote>,
    private connection: Connection,
  ) {
    super(cragRepository, sectorsRepository, routesRepository);
  }

  async find(input: FindRoutesServiceInput): Promise<Route[]> {
    return this.buildQuery(input).getMany();
  }

  async findOne(input: FindRoutesServiceInput): Promise<Route> {
    return this.buildQuery(input).getOneOrFail();
  }

  async findByIds(ids: string[]): Promise<Route[]> {
    return this.routesRepository.findByIds(ids);
  }

  async findOneById(id: string): Promise<Route> {
    return this.routesRepository.findOneOrFail(id);
  }

  async findOneBySlug(
    cragSlug: string,
    routeSlug: string,
    user: User,
  ): Promise<Route> {
    const builder = this.routesRepository.createQueryBuilder('r');

    builder
      .innerJoin('crag', 'c', 'c.id = r."cragId"')
      .where('r.slug = :routeSlug', { routeSlug: routeSlug })
      .andWhere('c.slug = :cragSlug', { cragSlug: cragSlug });
    // TODO ADD PUBLISH STATUS CONDITION !!

    if (!(user != null)) {
      builder.andWhere('c.isHidden = false');
    }

    return builder.getOneOrFail();
  }

  countManyTicks(keys: readonly string[]) {
    const builder = this.routesRepository
      .createQueryBuilder('r')
      .leftJoin('r.activityRoutes', 'ar', 'ar.ascentType in (:...aTypes)', {
        aTypes: [...tickAscentTypes],
      })
      .select('r.id')
      .addSelect('COUNT(ar.id)', 'nrTicks')
      .where('r.id IN (:...rIds)', { rIds: keys })
      .groupBy('r.id');

    return builder.getRawMany();
  }

  countManyTries(keys: readonly string[]) {
    const builder = this.routesRepository
      .createQueryBuilder('r')
      .leftJoin('r.activityRoutes', 'ar')
      .select('r.id')
      .addSelect('COUNT(ar.id)', 'nrTries')
      .where('r.id IN (:...rIds)', { rIds: keys })
      .groupBy('r.id');

    return builder.getRawMany();
  }

  countManyDisctinctClimbers(keys: readonly string[]) {
    const builder = this.routesRepository
      .createQueryBuilder('r')
      .leftJoin('r.activityRoutes', 'ar')
      .select('r.id')
      .addSelect('COUNT(DISTINCT(ar."userId")) as "nrClimbers"')
      .where('r.id IN (:...rIds)', { rIds: keys })
      .groupBy('r.id');

    return builder.getRawMany();
  }

  async create(data: CreateRouteInput, user: User): Promise<Route> {
    const route = new Route();

    this.routesRepository.merge(route, data);

    route.user = Promise.resolve(user);

    const sector = await this.sectorsRepository.findOneOrFail(data.sectorId);

    route.sectorId = sector.id;
    route.cragId = sector.cragId;

    route.slug = await this.generateRouteSlug(route.name, route.cragId);

    const transaction = new Transaction(this.connection);
    await transaction.start();

    try {
      await transaction.save(route);
      await this.shiftFollowingRoutes(route, transaction);

      if (data.baseDifficulty != null && !route.isProject) {
        await this.createBaseGrade(route, data.baseDifficulty, transaction);
      }
      await this.updateUserContributionsFlag(
        route.publishStatus,
        user,
        transaction,
      );
    } catch (e) {
      await transaction.rollback();
      throw e;
    }

    await transaction.commit();

    return Promise.resolve(route);
  }

  async update(data: UpdateRouteInput): Promise<Route> {
    const route = await this.routesRepository.findOneOrFail(data.id);

    this.routesRepository.merge(route, data);

    if (data.name != null) {
      route.slug = await this.generateRouteSlug(
        route.name,
        route.cragId,
        route.id,
      );
    }

    const transaction = new Transaction(this.connection);
    await transaction.start();

    try {
      await transaction.save(route);
      await this.shiftFollowingRoutes(route, transaction);
      const user = await route.user;
      await this.updateUserContributionsFlag(
        route.publishStatus,
        user,
        transaction,
      );
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
    const route = await this.routesRepository.findOneOrFail(id);

    const transaction = new Transaction(this.connection);
    await transaction.start();

    try {
      const user = await route.user;
      await transaction.delete(route);
      await this.updateUserContributionsFlag(null, user, transaction);
    } catch (e) {
      await transaction.rollback();
      throw e;
    }

    await transaction.commit();

    return Promise.resolve(true);
  }

  private async createBaseGrade(
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

  private buildQuery(
    params: FindRoutesServiceInput = {},
  ): SelectQueryBuilder<Route> {
    const builder = this.routesRepository.createQueryBuilder('s');

    builder.orderBy('s.position', 'ASC');

    if (params.sectorId != null) {
      builder.andWhere('s.sector = :sectorId', {
        sectorId: params.sectorId,
      });
    }

    if (params.id != null) {
      builder.andWhere('s.id = :id', {
        id: params.id,
      });
    }

    this.setPublishStatusParams(builder, 's', params);

    return builder;
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
