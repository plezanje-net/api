import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { AuditModule } from './audit/audit.module';
import { CragsModule } from './crags/crags.module';
import { UsersModule } from './users/users.module';

import { Audit } from './audit/entities/audit.entity';
import { Country } from './crags/entities/country.entity';
import { Crag } from './crags/entities/crag.entity';
import { Role } from './users/entities/role.entity';
import { Sector } from './crags/entities/sector.entity';
import { User } from './users/entities/user.entity';
import { Route } from './crags/entities/route.entity';
import { Area } from './crags/entities/area.entity';
import { Book } from './crags/entities/book.entity';
import { DifficultyVote } from './crags/entities/difficulty-vote.entity';
import { NotificationModule } from './notification/notification.module';
import { Comment } from './crags/entities/comment.entity';
import { ActivitiesModule } from './activities/activities.module';
import { ActivityRoute } from './activities/entities/activity-route.entity';
import { Activity } from './activities/entities/activity.entity';
import { Pitch } from './crags/entities/pitch.entity';
import { Image } from './crags/entities/image.entity';
import { Peak } from './crags/entities/peak.entity';
import { IceFall } from './crags/entities/ice-fall.entity';
import { Club } from './users/entities/club.entity';
import { ClubMember } from './users/entities/club-member.entity';
import { StarRatingVote } from './crags/entities/star-rating-vote.entity';
import { RouteType } from './crags/entities/route-type.entity';
import { GradingSystem } from './crags/entities/grading-system.entity';
import { Grade } from './crags/entities/grade.entity';
import { RouteEvent } from './crags/entities/route-event.entity';
import { AuthService } from './auth/services/auth.service';
import { AuthModule } from './auth/auth.module';
import { IceFallProperty } from './crags/entities/ice-fall-property.entity';
import { CragProperty } from './crags/entities/crag-property.entity';
import { RouteProperty } from './crags/entities/route-property.entity';
import { PropertyType } from './crags/entities/property-type.entity';
import EntityCacheSubscriber from './core/utils/entity-cache/entity-cache.subscriber';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { BullModule } from '@nestjs/bull';
import { Parking } from './crags/entities/parking.entity';
import { env } from 'process';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        port: configService.get('DB_PORT'),
        namingStrategy: new SnakeNamingStrategy(),
        cache:
          configService.get('ENTITY_CACHE') == 'enabled'
            ? {
                type: 'ioredis',
                options: {
                  host: configService.get('REDIS_HOST'),
                  port: configService.get('REDIS_PORT'),
                },
                duration: 1000 * 60 * 60 * 24,
              }
            : null,
        synchronize: false,
        entities: [
          Activity,
          ActivityRoute,
          Area,
          Audit,
          Book,
          Country,
          Crag,
          DifficultyVote,
          Role,
          Sector,
          User,
          Route,
          Peak,
          Pitch,
          Comment,
          Club,
          ClubMember,
          Image,
          IceFall,
          StarRatingVote,
          RouteType,
          RouteEvent,
          GradingSystem,
          Grade,
          RouteProperty,
          CragProperty,
          IceFallProperty,
          PropertyType,
          Parking,
        ],
        // subscribers: [EntityCacheSubscriber],
        // logging: ['query', 'error'],
        // maxQueryExecutionTime: 80,
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule, AuthModule],
      inject: [ConfigService, AuthService],
      driver: ApolloDriver,
      useFactory: async () => ({
        debug: true,
        playground: true,
        autoSchemaFile: true,
      }),
    }),
    AuditModule,
    UsersModule,
    CragsModule,
    NotificationModule,
    ActivitiesModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'summary',
      prefix: `bull:${env.ENVIRONMENT}`,
    }),
  ],
  providers: [],
})
export class AppModule {}
