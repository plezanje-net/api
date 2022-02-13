import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IceFall } from '../entities/ice-fall.entity';

@Injectable()
export class IceFallsService {
  constructor(
    @InjectRepository(IceFall)
    private iceFallsRepository: Repository<IceFall>,
  ) {}

  async findOneBySlug(slug: string): Promise<IceFall> {
    return this.iceFallsRepository.findOneOrFail({ slug: slug });
  }

  async getIceFalls(countryId: string, areaSlug?: string): Promise<IceFall[]> {
    const qb = this.iceFallsRepository.createQueryBuilder('icefall');
    qb.leftJoin('icefall.country', 'country');
    qb.where('country.id = :countryId', { countryId: countryId });

    if (areaSlug) {
      qb.leftJoin('icefall.area', 'area');
      qb.andWhere('area.slug = :areaSlug', { areaSlug: areaSlug });
    }

    qb.orderBy('icefall.name');

    return qb.getMany();
  }

  async nrIceFallsByCountry(countryId: string): Promise<number> {
    return this.iceFallsRepository.count({ where: { country: countryId } });
  }
}
