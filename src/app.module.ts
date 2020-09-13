import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

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

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      debug: true,
      playground: true,
      autoSchemaFile: true,
      context: ({ req }) => ({ req }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'plezanjenet',
      password: 'plezanjenet',
      database: 'plezanjenet',
      entities: [Area, Audit, Book, Country, Crag, Grade, Role, Sector, User, Route],
      synchronize: true,
      // logging: ["query", "error"]
    }),
    UsersModule,
    CragsModule,
    AuditModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
