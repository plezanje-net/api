import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
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
import { Grade } from './crags/entities/grade.entity';
import { NotificationModule } from './notification/notification.module';
import { Comment } from './crags/entities/comment.entity';
import { ActivitiesModule } from './activities/activities.module';
import { ActivityRoute } from './activities/entities/activity-route.entity';
import { Activity } from './activities/entities/activity.entity';
import { Pitch } from './crags/entities/pitch.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      debug: true,
      playground: true,
      autoSchemaFile: true,
      context: ({ req }) => ({ req }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Activity, ActivityRoute, Area, Audit, Book, Country, Crag, Grade, Role, Sector, User, Route, Pitch, Comment],
        synchronize: false,
        // logging: ["query", "error"]
      }),
      inject: [ConfigService]
    }),
    UsersModule,
    CragsModule,
    AuditModule,
    NotificationModule,
    ActivitiesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

/*
{
      type: 'postgres',


      // host: 'localhost',
      // host: '/cloudsql/plezanjenet-server:europe-west2:db',
      //35.246.30.8
      port: 5432,
      // username: 'plezanjenet',
      // password: 'plezanjenet',
      // database: 'plezanjenet',
      // username: 'postgres',
      // password: 'vCeMJJvmaKjFOzOE',
      // database: 'plezanjenet',
      entities: [Area, Audit, Book, Country, Crag, Grade, Role, Sector, User, Route],
      synchronize: true,
      // logging: ["query", "error"]
    }
*/