import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { Role } from './users/entities/role.entity';
import { Country } from './crags/entities/country.entity';
import { CragsModule } from './crags/crags.module';
import { Crag } from './crags/entities/crag.entity';
import { AuditModule } from './audit/audit.module';
import { Audit } from './audit/entities/audit.entity';
import { AuditSubscriber } from './audit/audit.subscriber';
import { AuditService } from './audit/audit.service';
import { Sector } from './crags/entities/sector.entity';

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
      entities: [User, Role, Country, Crag, Audit, Sector],
      synchronize: true
    }),
    UsersModule,
    CragsModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
