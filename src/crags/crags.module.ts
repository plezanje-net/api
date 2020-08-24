import { Module, forwardRef } from '@nestjs/common';
import { CragsResolver } from './crags.resolver';
import { CragsService } from './crags.service';
import { Crag } from './entities/crag.entity';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from 'src/audit/audit.module';
import { Country } from 'src/countries/entities/country.entity';
import { CountriesModule } from 'src/countries/countries.module';

@Module({
  imports: [TypeOrmModule.forFeature([Crag, Country]), AuditModule, forwardRef(() => CountriesModule)],
  providers: [CragsResolver, CragsService],
  exports: [CragsService]
})
export class CragsModule {}
