import { Module } from '@nestjs/common';
import { GqlExecutionContext, GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
import { Rating } from './crags/entities/rating.entity';
import { RouteType } from './crags/entities/route-type.entity';
import { GradingSystem } from './crags/entities/grading-system.entity';
import { Grade } from './crags/entities/grade.entity';
import { RouteEvent } from './crags/entities/route-event.entity';
import responseCachePlugin from 'apollo-server-plugin-response-cache';
import { ApolloServerPluginCacheControl } from 'apollo-server-core';
import { AuthService } from './auth/services/auth.service';
import { AuthModule } from './auth/auth.module';
import { CacheControlService } from './core/services/cache-control.service';
import Redis from 'ioredis';

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
        // logging: true,
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
          Rating,
          RouteType,
          RouteEvent,
          GradingSystem,
          Grade,
        ],
        synchronize: false,
        // logging: ['query', 'error'],
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule, AuthModule],
      inject: [ConfigService, AuthService, CacheControlService],
      useFactory: async (
        configService: ConfigService,
        authService: AuthService,
        cacheControlService: CacheControlService,
      ) => ({
        debug: true,
        playground: true,
        autoSchemaFile: true,
        plugins: [
          responseCachePlugin({
            cache: cacheControlService.init({
              client: new Redis({
                host: configService.get('REDIS_HOST'),
                port: configService.get('REDIS_PORT'),
              }),
            }),
            shouldWriteToCache: () => true,
            shouldReadFromCache: () => true,
            sessionId: requestContext =>
              requestContext.request.http.headers.get('Authorization'),
            extraCacheKeyData: async requestContext => {
              if (requestContext.request.http.headers.get('Authorization')) {
                const jwt = authService.decodeJwt(
                  requestContext.request.http.headers
                    .get('Authorization')
                    .split(' ')[1],
                );

                const user = await authService.validateJwtPayload(jwt);
                return { roles: user.roles.map(role => role.role) };
              }
            },
          }),
          ApolloServerPluginCacheControl({
            defaultMaxAge: configService.get('REDIS_TTL'),
          }),
          {
            async requestDidStart() {
              return {
                async willSendResponse(m) {
                  if (m.operation.operation == 'mutation') {
                    cacheControlService.flush();
                  }
                },
              };
            },
          },
        ],
      }),
    }),
    UsersModule,
    CragsModule,
    AuditModule,
    NotificationModule,
    ActivitiesModule,
  ],
  providers: [],
})
export class AppModule {}
