import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from '../entities/country.entity';
import { Repository } from 'typeorm';
import { CreateCountryInput } from '../inputs/create-country.input';
import { UpdateCountryInput } from '../inputs/update-country.input';

@Injectable()
export class CountriesService {
    constructor(
        @InjectRepository(Country)
        private countriesRepository: Repository<Country>
    ) { }

    get(params: string): Promise<Country> {
        return this.countriesRepository.findOne(params);
    }

    findAll(): Promise<Country[]> {
        return this.countriesRepository.find();
    }

    create(data: CreateCountryInput): Promise<Country> {
        const country = new Country

        this.countriesRepository.merge(country, data);

        return this.countriesRepository.save(country)
    }

    async update(data: UpdateCountryInput): Promise<Country> {
        const country = await this.countriesRepository.findOne(data.id);

        if (country == undefined) {
            throw NotFoundException
        }

        this.countriesRepository.merge(country, data);

        return this.countriesRepository.save(country)
    }

    async delete(id: string): Promise<boolean> {
        const country = await this.countriesRepository.findOne(id);

        if (country == undefined) {
            throw NotFoundException
        }

        return this.countriesRepository.remove(country).then(() => true)
    }
}
