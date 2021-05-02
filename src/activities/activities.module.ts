import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resolver } from 'dns';
import { AuditModule } from 'src/audit/audit.module';
import { Crag } from 'src/crags/entities/crag.entity';
import { Pitch } from 'src/crags/entities/pitch.entity';
import { Route } from 'src/crags/entities/route.entity';
import { ActivityRoute } from './entities/activity-route.entity';
import { Activity } from './entities/activity.entity';
import { ActivitiesResolver } from './resolvers/activities.resolver';
import { ActivitiesService } from './services/activities.service';
import { ActivityRoutesResolver } from './resolvers/activity-routes.resolver';
import { ActivityRoutesService } from './services/activity-routes.service';

@Module({
    imports: [TypeOrmModule.forFeature([Activity, ActivityRoute, Crag, Route, Pitch]), AuditModule],
    providers: [ActivitiesResolver, ActivitiesService, ActivityRoutesResolver, ActivityRoutesService],
})
export class ActivitiesModule {

}
