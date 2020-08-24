import { Module } from '@nestjs/common';
import { CragsResolver } from './crags.resolver';
import { CragsService } from './crags.service';
import { Crag } from './entities/crag.entity';

import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Crag])],
  providers: [CragsResolver, CragsService]
})
export class CragsModule {}
