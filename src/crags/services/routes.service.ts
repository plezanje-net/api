import { Injectable } from '@nestjs/common';
import { Route } from '../entities/route.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Sector } from '../entities/sector.entity';
import { In, Not, Repository } from 'typeorm';
import { CreateRouteInput } from '../dtos/create-route.input';
import { UpdateRouteInput } from '../dtos/update-route.input';
import { CragStatus } from '../entities/crag.entity';
import slugify from 'slugify';
import { DifficultyVote } from '../entities/difficulty-vote.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    @InjectRepository(Sector)
    private sectorsRepository: Repository<Sector>,
    @InjectRepository(DifficultyVote)
    private difficultyVoteRepository: Repository<DifficultyVote>,
  ) {}

  async findBySector(sectorId: string): Promise<Route[]> {
    return this.routesRepository.find({
      where: { sector: sectorId },
      order: { position: 'ASC' },
    });
  }

  async findBySectorIds(sectorIds: string[]): Promise<Route[]> {
    return this.routesRepository.find({
      where: { sectorId: In(sectorIds) },
      order: { position: 'ASC' },
    });
  }

  async findOneBySlug(
    cragSlug: string,
    routeSlug: string,
    minStatus: CragStatus,
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

  async create(data: CreateRouteInput): Promise<Route> {
    const route = new Route();

    this.routesRepository.merge(route, data);

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

  createBaseGrade(route: Route, difficulty: number): Promise<DifficultyVote> {
    const vote = new DifficultyVote();
    vote.route = Promise.resolve(route);
    vote.difficulty = difficulty;
    vote.isBase = true;

    return this.difficultyVoteRepository.save(vote);
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

    const votes = await route.difficultyVotes;

    if (votes.length == 1 && votes[0].isBase) {
      await this.difficultyVoteRepository.remove(votes[0]);
    }

    return this.routesRepository.remove(route).then(() => true);
  }

  async findOneById(id: string): Promise<Route> {
    return this.routesRepository.findOneOrFail(id);
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
