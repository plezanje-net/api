import { Module, forwardRef } from '@nestjs/common';
import { CountriesResolver } from './countries.resolver';
import { CountriesService } from './countries.service';
import { Country } from './entities/country.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from 'src/audit/audit.module';
import { Crag } from 'src/crags/entities/crag.entity';
import { CragsModule } from 'src/crags/crags.module';

@Module({
  imports: [TypeOrmModule.forFeature([Country, Crag]), AuditModule, forwardRef(() => CragsModule)],
  providers: [CountriesResolver, CountriesService],
  exports: [CountriesService]
})
export class CountriesModule { }
