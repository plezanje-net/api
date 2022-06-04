import { Injectable } from '@nestjs/common';
import { Route } from '../entities/route.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Sector } from '../entities/sector.entity';
import { In, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateRouteInput } from '../dtos/create-route.input';
import { UpdateRouteInput } from '../dtos/update-route.input';
import slugify from 'slugify';
import { DifficultyVote } from '../entities/difficulty-vote.entity';
import { User } from '../../users/entities/user.entity';
import { EntityStatus } from '../entities/enums/entity-status.enum';
import { FindRoutesServiceInput } from '../dtos/find-routes-service.input';
import { BaseService } from './base.service';

@Injectable()
export class RoutesService extends BaseService {
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    @InjectRepository(Sector)
    private sectorsRepository: Repository<Sector>,
    @InjectRepository(DifficultyVote)
    private difficultyVoteRepository: Repository<DifficultyVote>,
  ) {
    super();
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
    minStatus: EntityStatus,
  ): Promise<Route> {
    const builder = this.routesRepository.createQueryBuilder('r');

    builder
      .innerJoin('crag', 'c', 'c.id = r."cragId"')
      .where('r.slug = :routeSlug', { routeSlug: routeSlug })
      .andWhere('c.slug = :cragSlug', { cragSlug: cragSlug })
      .andWhere('c.status <= :minStatus', {
        minStatus: minStatus,
      });

    return builder.getOneOrFail();
  }

  async create(data: CreateRouteInput, user: User): Promise<Route> {
    const route = new Route();

    this.routesRepository.merge(route, data);

    route.user = Promise.resolve(user);

    const sector = await this.sectorsRepository.findOneOrFail(data.sectorId);

    route.sector = Promise.resolve(sector);
    route.cragId = sector.cragId;

    route.slug = await this.generateRouteSlug(route.name, route.cragId);

    if (data.baseDifficulty == null || route.isProject) {
      return this.routesRepository.save(route);
    }

    await this.routesRepository.save(route);

    if (data.baseDifficulty != null && !route.isProject) {
      await this.createBaseGrade(route, data.baseDifficulty);
    }

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

    return this.routesRepository.save(route);
  }

  async delete(id: string): Promise<boolean> {
    const route = await this.routesRepository.findOneOrFail(id);

    return this.routesRepository.remove(route).then(() => true);
  }

  private createBaseGrade(
    route: Route,
    difficulty: number,
  ): Promise<DifficultyVote> {
    const vote = new DifficultyVote();
    vote.route = Promise.resolve(route);
    vote.difficulty = difficulty;
    vote.isBase = true;

    return this.difficultyVoteRepository.save(vote);
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

    this.setEntityStatusParams(builder, 's', params);

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
      (await this.routesRepository.findOne({
        where: { ...selfCond, slug: slug + suffix, crag: cragId },
      })) !== undefined
    ) {
      suffixCounter++;
      suffix = '-' + suffixCounter;
    }
    slug += suffix;
    return slug;
  }
}
