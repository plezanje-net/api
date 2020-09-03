import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from '../entities/country.entity';
import { Repository } from 'typeorm';
import { CreateCountryInput } from '../dtos/create-country.input';
import { UpdateCountryInput } from '../dtos/update-country.input';

@Injectable()
export class CountriesService {
    constructor(
        @InjectRepository(Country)
        private countriesRepository: Repository<Country>
    ) { }

    findOneBySlug(slug: string): Promise<Country> {
        return this.countriesRepository.findOneOrFail({ slug: slug });
    }

    findOneById(id: string): Promise<Country> {
        return this.countriesRepository.findOneOrFail(id);
    }

    find(): Promise<Country[]> {
        return this.countriesRepository.find({ order: { name: 'ASC' } });
    }

    create(data: CreateCountryInput): Promise<Country> {
        const country = new Country

        this.countriesRepository.merge(country, data);

        return this.countriesRepository.save(country)
    }

    async update(data: UpdateCountryInput): Promise<Country> {
        const country = await this.countriesRepository.findOneOrFail(data.id);

        this.countriesRepository.merge(country, data);

        return this.countriesRepository.save(country)
    }

    async delete(id: string): Promise<boolean> {
        const country = await this.countriesRepository.findOneOrFail(id);

        return this.countriesRepository.remove(country).then(() => true)
    }
}
