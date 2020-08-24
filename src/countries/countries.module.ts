import { Module } from '@nestjs/common';
import { CountriesResolver } from './countries.resolver';
import { CountriesService } from './countries.service';
import { Country } from './entities/country.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Country]), AuditModule],
  providers: [CountriesResolver, CountriesService]
})
export class CountriesModule { }
