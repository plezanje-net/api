import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';

import { CountriesResolver } from './resolvers/countries.resolver';
import { CountriesService } from './services/countries.service';
import { Country } from '../crags/entities/country.entity';

import { CragsResolver } from './resolvers/crags.resolver';
import { CragsService } from './services/crags.service';
import { Crag } from './entities/crag.entity';
import { SectorsService } from './services/sectors.service';
import { SectorsResolver } from './resolvers/sectors.resolver';
import { Sector } from './entities/sector.entity';
import { Route } from './entities/route.entity';
import { RoutesService } from './services/routes.service';
import { RoutesResolver } from './resolvers/routes.resolver';
import { Area } from './entities/area.entity';
import { AreasService } from './services/areas.service';
import { AreasResolver } from './resolvers/areas.resolver';
import { Comment } from './entities/comment.entity';
import { CommentsService } from './services/comments.service';
import { Pitch } from './entities/pitch.entity';
import { Image } from './entities/image.entity';
import { Peak } from './entities/peak.entity';
import { IceFall } from './entities/ice-fall.entity';
import { User } from '../users/entities/user.entity';
import { CommentsResolver } from './resolvers/comments.resolver';
import { SearchService } from './services/search.service';
import { SearchResolver } from './resolvers/search.resolver';
import { GradesService } from './services/grades.service';
import { DifficultyVote } from './entities/difficulty-vote.entity';
import { ImagesResolver } from './resolvers/images.resolver';
import { ImagesService } from './services/images.service';
import { PitchesService } from './services/pitches.service';
import { RouteCommentsLoader } from './loaders/route-comments.loader';
import { RoutePitchesLoader } from './loaders/route-pitches.loader';
import { DifficultyVotesService } from './services/difficulty-votes.service';
import { Grade } from './entities/grade.entity';
import { GradingSystem } from './entities/grading-system.entity';
import { RouteType } from './entities/route-type.entity';
import { GradingSystemsResolver } from './resolvers/grading-systems.resolver';
import { GradingSystemsService } from './services/grading-systems.service';
import { IceFallsResolver } from './resolvers/ice-falls.resolver';
import { IceFallsService } from './services/ice-falls.service';
import { PeaksService } from './services/peaks.service';
import { PeaksResolver } from './resolvers/peaks.resolver';
import { GradingSystemLoader } from './loaders/grading-system.loader';
import { RouteTypesService } from './services/route-types.service';
import { RouteTypeLoader } from './loaders/route-type.loader';
import { CountryLoader } from './loaders/country.loader';
import { RouteProperty } from './entities/route-property.entity';
import { CragProperty } from './entities/crag-property.entity';
import { IceFallProperty } from './entities/ice-fall-property.entity';
import { EntityPropertiesService } from './services/entity-properties.service';
import { NotificationService } from '../notification/services/notification.service';
import { MailService } from '../notification/services/mail.service';
import { ConfigService } from '@nestjs/config';
import { StarRatingVotesResolver } from './resolvers/star-rating-votes.resolver';
import { StarRatingVotesService } from './services/star-rating-votes.service';
import { StarRatingVote } from './entities/star-rating-vote.entity';
import { SectorRoutesLoader } from './loaders/sector-routes.loader';
import { UploadController } from './controllers/upload/upload.controller';
import { Activity } from '../activities/entities/activity.entity';
import { ActivityRoute } from '../activities/entities/activity-route.entity';
import { BullModule } from '@nestjs/bull';
import { SummaryQueueConsumer } from './consumers/summary-queue.consumer';
import { CragLoader } from './loaders/crag.loader';
import { RouteLoader } from './loaders/route.loader';
import { RouteEvent } from './entities/route-event.entity';
import { Parking } from './entities/parking.entity';
import { ParkingsService } from './services/parkings.service';
import { AreaLoader } from './loaders/area.loader';
import { ActivityRoutesService } from '../activities/services/activity-routes.service';
import { ActivitiesModule } from '../activities/activities.module';
import { ClubMember } from '../users/entities/club-member.entity';
import { Club } from '../users/entities/club.entity';
import { env } from 'process';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      ActivityRoute,
      Area,
      Crag,
      Country,
      IceFall,
      Image,
      Sector,
      Route,
      Pitch,
      Peak,
      Comment,
      User,
      Grade,
      GradingSystem,
      RouteType,
      DifficultyVote,
      RouteEvent,
      RouteProperty,
      CragProperty,
      IceFallProperty,
      StarRatingVote,
      Parking,
      Club,
      ClubMember,
    ]),
    forwardRef(() => ActivitiesModule),
    forwardRef(() => AuditModule),
    BullModule.registerQueue({
      name: 'summary',
      prefix: `bull:${env.ENVIRONMENT}`,
    }),
  ],
  providers: [
    CragsResolver,
    CragsService,
    CountriesResolver,
    CountriesService,
    SectorsResolver,
    SectorsService,
    RoutesService,
    RoutesResolver,
    AreasService,
    AreasResolver,
    CommentsService,
    CommentsResolver,
    SearchResolver,
    StarRatingVotesResolver,
    StarRatingVotesService,
    SearchService,
    GradesService,
    ImagesResolver,
    ImagesService,
    PitchesService,
    RouteCommentsLoader,
    RoutePitchesLoader,
    GradingSystemLoader,
    RouteTypeLoader,
    CountryLoader,
    SectorRoutesLoader,
    DifficultyVotesService,
    GradingSystemsResolver,
    GradingSystemsService,
    IceFallsResolver,
    IceFallsService,
    PeaksResolver,
    PeaksService,
    RouteTypesService,
    EntityPropertiesService,
    NotificationService,
    MailService,
    SummaryQueueConsumer,
    ConfigService,
    AreaLoader,
    CragLoader,
    RouteLoader,
    ParkingsService,
    ActivityRoutesService,
  ],
  controllers: [UploadController],
  exports: [
    CragsService,
    SectorsService,
    RoutesService,
    CragLoader,
    RouteLoader,
    CommentsService,
    ImagesService,
  ],
})
export class CragsModule {}
