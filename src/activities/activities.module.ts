import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { Crag } from '../crags/entities/crag.entity';
import { Pitch } from '../crags/entities/pitch.entity';
import { Route } from '../crags/entities/route.entity';
import { ActivityRoute } from './entities/activity-route.entity';
import { Activity } from './entities/activity.entity';
import { ActivitiesResolver } from './resolvers/activities.resolver';
import { ActivitiesService } from './services/activities.service';
import { ActivityRoutesResolver } from './resolvers/activity-routes.resolver';
import { ActivityRoutesService } from './services/activity-routes.service';
import { UsersModule } from '../users/users.module';
import { ClubMember } from '../users/entities/club-member.entity';
import { Club } from '../users/entities/club.entity';
import { DifficultyVote } from '../crags/entities/difficulty-vote.entity';
import { ActivityLoader } from './loaders/activity.loader';
import { StarRatingVote } from '../crags/entities/star-rating-vote.entity';
import { RouteLoader } from '../crags/loaders/route.loader';
import { CragLoader } from '../crags/loaders/crag.loader';
import { RoutesService } from '../crags/services/routes.service';
import { CragsService } from '../crags/services/crags.service';
import { Sector } from '../crags/entities/sector.entity';
import { Country } from '../crags/entities/country.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from '../core/interceptors/data-loader.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      ActivityRoute,
      Crag,
      Route,
      Pitch,
      ClubMember,
      Club,
      DifficultyVote,
      StarRatingVote,
      Sector,
      Country,
    ]),
    AuditModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
    ActivitiesResolver,
    ActivitiesService,
    ActivityRoutesResolver,
    ActivityRoutesService,
    ActivityLoader,
    RoutesService,
    CragsService,
    RouteLoader,
    CragLoader,
  ],
})
export class ActivitiesModule {}
