import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from '../entities/country.entity';
import { Repository } from 'typeorm';
import { CreateCountryInput } from '../dtos/create-country.input';
import { UpdateCountryInput } from '../dtos/update-country.input';
import { FindCountriesInput } from '../dtos/find-countries.input';

export interface CountryFindParams {
  orderBy: any;
}

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private countriesRepository: Repository<Country>,
  ) {}

  findOneBySlug(slug: string): Promise<Country> {
    return this.countriesRepository.findOneOrFail({ slug: slug });
  }

  findOneById(id: string): Promise<Country> {
    return this.countriesRepository.findOneOrFail(id);
  }

  findByIds(ids: string[]): Promise<Country[]> {
    const qb = this.countriesRepository.createQueryBuilder('country');
    return qb.whereInIds(ids).getMany();
  }

  find(params: FindCountriesInput = {}): Promise<Country[]> {
    const qb = this.countriesRepository.createQueryBuilder('country');

    if (params.orderBy != null) {
      qb.orderBy(
        'country.' + (params.orderBy.field || 'name'),
        params.orderBy.direction || 'ASC',
      );
    }

    if (params.hasCrags != null && params.hasCrags) {
      qb.where('"nrCrags" > 0');
    }

    if (params.hasIceFalls != null && params.hasIceFalls) {
      qb.innerJoin('country.iceFalls', 'iceFall');
    }

    if (params.hasPeaks) {
      qb.leftJoinAndSelect('country.peaks', 'peak').andWhere(
        'peak.id is not null',
      );
    } else if (params.hasPeaks != null && !params.hasPeaks) {
      qb.leftJoinAndSelect('country.peaks', 'peak').andWhere('peak.id is null');
    }

    return qb.getMany();
  }

  create(data: CreateCountryInput): Promise<Country> {
    const country = new Country();

    this.countriesRepository.merge(country, data);

    return this.countriesRepository.save(country);
  }

  async update(data: UpdateCountryInput): Promise<Country> {
    const country = await this.countriesRepository.findOneOrFail(data.id);

    this.countriesRepository.merge(country, data);

    return this.countriesRepository.save(country);
  }

  async delete(id: string): Promise<boolean> {
    const country = await this.countriesRepository.findOneOrFail(id);

    return this.countriesRepository.remove(country).then(() => true);
  }
}
