import { Injectable } from '@nestjs/common';
import { Area } from '../entities/area.entity';
import { CreateAreaInput } from '../dtos/create-area.input';
import { UpdateAreaInput } from '../dtos/update-area.input';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, MoreThan, Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { FindAreasInput } from '../dtos/find-areas.input';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private areasRepository: Repository<Area>,
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
  ) {}

  findOneById(id: string): Promise<Area> {
    return this.areasRepository.findOneOrFail(id);
  }

  find(params: FindAreasInput = {}): Promise<Area[]> {
    const options: FindManyOptions = {
      order: {},
      where: {},
    };

    if (params.orderBy != null) {
      options.order[params.orderBy.field || 'name'] =
        params.orderBy.direction || 'ASC';
    } else {
      options.order.name = 'ASC';
    }

    if (params.hasCrags != null && params.hasCrags) {
      options.where['nrCrags'] = MoreThan(0);
    }

    if (params.countryId != null) {
      options.where['country'] = params.countryId;
    }

    return this.areasRepository.find(options);
  }

  async create(data: CreateAreaInput): Promise<Area> {
    const area = new Area();

    this.areasRepository.merge(area, data);

    area.country = Promise.resolve(
      await this.countryRepository.findOneOrFail(data.countryId),
    );

    return this.areasRepository.save(area);
  }

  async update(data: UpdateAreaInput): Promise<Area> {
    const area = await this.areasRepository.findOneOrFail(data.id);

    this.areasRepository.merge(area, data);

    area.country = Promise.resolve(
      await this.countryRepository.findOneOrFail(data.countryId),
    );

    return this.areasRepository.save(area);
  }

  async delete(id: string): Promise<boolean> {
    const area = await this.areasRepository.findOneOrFail(id);

    return this.areasRepository.remove(area).then(() => true);
  }
}
