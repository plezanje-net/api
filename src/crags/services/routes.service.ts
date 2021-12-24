import { Injectable } from '@nestjs/common';
import { Route } from '../entities/route.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Sector } from '../entities/sector.entity';
import { In, Repository } from 'typeorm';
import { CreateRouteInput } from '../dtos/create-route.input';
import { UpdateRouteInput } from '../dtos/update-route.input';
import { CragStatus } from '../entities/crag.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    @InjectRepository(Sector)
    private sectorsRepository: Repository<Sector>,
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

    route.sector = Promise.resolve(
      await this.sectorsRepository.findOneOrFail(data.sectorId),
    );

    return this.routesRepository.save(route);
  }

  async update(data: UpdateRouteInput): Promise<Route> {
    const route = await this.routesRepository.findOneOrFail(data.id);

    this.routesRepository.merge(route, data);

    return this.routesRepository.save(route);
  }

  async delete(id: string): Promise<boolean> {
    const route = await this.routesRepository.findOneOrFail(id);

    return this.routesRepository.remove(route).then(() => true);
  }

  async findOneById(id: string): Promise<Route> {
    return this.routesRepository.findOneOrFail(id);
  }
}
