import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from 'src/audit/audit.module';

import { CountriesResolver } from './resolvers/countries.resolver';
import { CountriesService } from './services/countries.service';
import { Country } from 'src/crags/entities/country.entity';

import { CragsResolver } from './resolvers/crags.resolver';
import { CragsService } from './services/crags.service';
import { Crag } from './entities/crag.entity';
import { SectorsService } from './services/sectors.service';
import { SectorsResolver } from './resolvers/sectors.resolver';
import { Sector } from './entities/sector.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Crag, Country, Sector]), AuditModule],
  providers: [CragsResolver, CragsService, CountriesResolver, CountriesService, SectorsResolver, SectorsService],
})
export class CragsModule { }
