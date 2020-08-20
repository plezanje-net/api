import { Module } from '@nestjs/common';
import { CountriesResolver } from './countries.resolver';
import { CountriesService } from './countries.service';
import { Country } from './entries/country.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  providers: [CountriesResolver, CountriesService]
})
export class CountriesModule {}
