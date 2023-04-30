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
import { BullModule } from '@nestjs/bull';

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
    BullModule.registerQueue({
      name: 'process-crag',
    }),
  ],
  providers: [
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
