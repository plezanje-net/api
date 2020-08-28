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
      entities: [Audit, Country, Crag, Role, Sector, User],
      synchronize: true,
      // logging: ["query", "error"]
    }),
    UsersModule,
    CragsModule,
    AuditModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
