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
    ]),
    AuditModule,
    UsersModule,
  ],
  providers: [
    ActivitiesResolver,
    ActivitiesService,
    ActivityRoutesResolver,
    ActivityRoutesService,
    ActivityLoader,
  ],
})
export class ActivitiesModule {}
