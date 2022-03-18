import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { Country } from '../entities/country.entity';
import { CountriesService } from '../services/countries.service';

@Injectable()
export class CountryLoader implements NestDataLoader<string, Country> {
  constructor(private readonly countriesService: CountriesService) {}

  generateDataLoader(): DataLoader<string, Country> {
    return new DataLoader<string, Country>(async keys => {
      const countries = await this.countriesService.findByIds(keys.map(k => k));

      const countriesMap: { [key: string]: Country } = {};

      countries.forEach(country => {
        countriesMap[country.id] = country;
      });

      return keys.map(countryId => countriesMap[countryId] ?? null);
    });
  }
}
