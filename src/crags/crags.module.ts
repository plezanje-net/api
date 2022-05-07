import { Module } from '@nestjs/common';
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
import { DataLoaderInterceptor } from '../core/interceptors/data-loader.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RoutePitchesLoader } from './loaders/route-pitches.loader';
import { SectorRoutesLoader } from './loaders/sector-routes.loader';
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
import { RouteLoader } from './loaders/route.loader';
import { CragLoader } from './loaders/crag.loader';
import { RouteProperty } from './entities/route-property.entity';
import { CragProperty } from './entities/crag-property.entity';
import { IceFallProperty } from './entities/ice-fall-property.entity';
import { EntityPropertiesService } from './services/entity-properties.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
      RouteProperty,
      CragProperty,
      IceFallProperty,
    ]),
    AuditModule,
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
    SearchService,
    GradesService,
    ImagesResolver,
    ImagesService,
    PitchesService,
    RouteCommentsLoader,
    RoutePitchesLoader,
    SectorRoutesLoader,
    GradingSystemLoader,
    RouteTypeLoader,
    CountryLoader,
    RouteLoader,
    CragLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
    DifficultyVotesService,
    GradingSystemsResolver,
    GradingSystemsService,
    IceFallsResolver,
    IceFallsService,
    PeaksResolver,
    PeaksService,
    RouteTypesService,
    EntityPropertiesService,
  ],
})
export class CragsModule {}
