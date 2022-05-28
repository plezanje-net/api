import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sector } from '../entities/sector.entity';
import { Not, Repository, SelectQueryBuilder } from 'typeorm';
import { UpdateSectorInput } from '../dtos/update-sector.input';
import { CreateSectorInput } from '../dtos/create-sector.input';
import { Crag } from '../entities/crag.entity';
import { Route } from '../entities/route.entity';
import { User } from '../../users/entities/user.entity';
import { FindSectorsServiceInput } from '../dtos/find-sectors-service.input';
import { BaseService } from './base.service';

@Injectable()
export class SectorsService extends BaseService {
  constructor(
    @InjectRepository(Sector)
    private sectorsRepository: Repository<Sector>,
    @InjectRepository(Crag)
    private cragsRepository: Repository<Crag>,
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
  ) {
    super();
  }

  async find(input: FindSectorsServiceInput): Promise<Sector[]> {
    return this.buildQuery(input).getMany();
  }
  async findOne(input: FindSectorsServiceInput): Promise<Sector> {
    return this.buildQuery(input).getOneOrFail();
  }

  async findOneById(id: string): Promise<Sector> {
    return this.buildQuery({ id: id }).getOneOrFail();
  }

  async create(data: CreateSectorInput, user: User): Promise<Sector> {
    const sector = new Sector();

    this.sectorsRepository.merge(sector, data);

    sector.user = Promise.resolve(user);

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

  private buildQuery(
    params: FindSectorsServiceInput = {},
  ): SelectQueryBuilder<Sector> {
    const builder = this.sectorsRepository.createQueryBuilder('s');

    builder.orderBy('s.position', 'ASC');

    if (params.cragId != null) {
      builder.andWhere('s.crag = :cragId', {
        cragId: params.cragId,
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
}
