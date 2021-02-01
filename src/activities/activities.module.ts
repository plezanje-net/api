import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from 'src/audit/audit.module';
import { Crag } from 'src/crags/entities/crag.entity';
import { Route } from 'src/crags/entities/route.entity';
import { ActivityRoute } from './entities/activity-route.entity';
import { Activity } from './entities/activity.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Activity, ActivityRoute, Crag, Route]), AuditModule],
})
export class ActivitiesModule {}
