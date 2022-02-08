import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sector } from '../entities/sector.entity';
import { Not, Repository } from 'typeorm';
import { UpdateSectorInput } from '../dtos/update-sector.input';
import { CreateSectorInput } from '../dtos/create-sector.input';
import { Crag } from '../entities/crag.entity';
import { Route } from '../entities/route.entity';

@Injectable()
export class SectorsService {
  constructor(
    @InjectRepository(Sector)
    private sectorsRepository: Repository<Sector>,
    @InjectRepository(Crag)
    private cragsRepository: Repository<Crag>,
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
  ) {}

  async findByCrag(cragId: string): Promise<Sector[]> {
    return this.sectorsRepository.find({
      where: { cragId: cragId },
      order: { position: 'ASC' },
    });
  }

  async findOneById(id: string): Promise<Sector> {
    return this.sectorsRepository.findOneOrFail(id);
  }

  async create(data: CreateSectorInput): Promise<Sector> {
    const sector = new Sector();

    this.sectorsRepository.merge(sector, data);

    sector.crag = Promise.resolve(
      await this.cragsRepository.findOneOrFail(data.cragId),
    );

    return this.sectorsRepository.save(sector);
  }

  async update(data: UpdateSectorInput): Promise<Sector> {
    const sector = await this.sectorsRepository.findOneOrFail(data.id);

    this.sectorsRepository.merge(sector, data);

    return this.sectorsRepository.save(sector);
  }

  async delete(id: string): Promise<boolean> {
    const sector = await this.sectorsRepository.findOneOrFail(id);

    return this.sectorsRepository.remove(sector).then(() => true);
  }

  async bouldersOnly(sectorId: string): Promise<boolean> {
    const cnt = this.routesRepository.count({
      sectorId: sectorId,
      routeTypeId: Not('boulder'),
    });

    return cnt.then(cnt => !cnt);
  }
}
