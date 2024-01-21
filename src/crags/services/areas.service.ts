import { Injectable } from '@nestjs/common';
import { Area } from '../entities/area.entity';
import { CreateAreaInput } from '../dtos/create-area.input';
import { UpdateAreaInput } from '../dtos/update-area.input';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, IsNull, MoreThan, Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { FindAreasInput } from '../dtos/find-areas.input';
import slugify from 'slugify';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private areasRepository: Repository<Area>,
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
  ) {}

  findOneById(id: string): Promise<Area> {
    return this.areasRepository.findOneByOrFail({ id });
  }

  findOneBySlug(slug: string): Promise<Area> {
    return this.areasRepository.findOneByOrFail({ slug });
  }

  findByIds(ids: string[]): Promise<Area[]> {
    const qb = this.areasRepository.createQueryBuilder('area');
    return qb.whereInIds(ids).getMany();
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
      options.where['countryId'] = params.countryId;
    }

    if (params.areaId !== undefined) {
      options.where['areaId'] =
        params.areaId != null ? params.areaId : IsNull();
    }
    return this.areasRepository.find(options);
  }

  async create(data: CreateAreaInput): Promise<Area> {
    const area = new Area();

    this.areasRepository.merge(area, data);

    area.country = Promise.resolve(
      await this.countryRepository.findOneByOrFail({ id: data.countryId }),
    );

    area.slug = await this.generateAreaSlug(area.name);

    return this.areasRepository.save(area);
  }

  async update(data: UpdateAreaInput): Promise<Area> {
    const area = await this.areasRepository.findOneByOrFail({ id: data.id });

    this.areasRepository.merge(area, data);

    area.country = Promise.resolve(
      await this.countryRepository.findOneByOrFail({ id: data.countryId }),
    );

    return this.areasRepository.save(area);
  }

  async delete(id: string): Promise<boolean> {
    const area = await this.areasRepository.findOneByOrFail({ id });

    return this.areasRepository.remove(area).then(() => true);
  }

  private async generateAreaSlug(areaName: string) {
    let slug = slugify(areaName, { lower: true });
    let suffixCounter = 0;
    let suffix = '';

    while (
      await this.areasRepository.findOne({
        where: { slug: slug + suffix },
      })
    ) {
      suffixCounter++;
      suffix = '-' + suffixCounter;
    }
    slug += suffix;

    return slug;
  }
}
