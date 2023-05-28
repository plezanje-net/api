import { Module, forwardRef } from '@nestjs/common';
import { Audit } from './entities/audit.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './services/audit.service';
import { AuditSubscriber } from './subscribers/audit.subscriber';
import { AuthModule } from '../auth/auth.module';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { ContributionsResolver } from './resolvers/contributions.resolver';
import { ContributionsService } from './services/contributions.service';
import { Route } from '../crags/entities/route.entity';
import { Sector } from '../crags/entities/sector.entity';
import { Crag } from '../crags/entities/crag.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { Country } from '../crags/entities/country.entity';
import { Area } from '../crags/entities/area.entity';
import { GradingSystem } from '../crags/entities/grading-system.entity';
import { DifficultyVote } from '../crags/entities/difficulty-vote.entity';
import { Activity } from '../activities/entities/activity.entity';
import { ActivityRoute } from '../activities/entities/activity-route.entity';
import { BullModule } from '@nestjs/bull';
import { UsersModule } from '../users/users.module';
import { CragsModule } from '../crags/crags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      ActivityRoute,
      Audit,
      Route,
      Sector,
      Crag,
      User,
      Country,
      Area,
      Role,
      GradingSystem,
      DifficultyVote,
    ]),
    AuthModule,
    BullModule.registerQueue({
      name: 'summary',
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => CragsModule),
  ],
  providers: [
    AuditService,
    AuditSubscriber,
    AuditInterceptor,
    ContributionsResolver,
    ContributionsService,
  ],
  exports: [AuditService],
})
export class AuditModule {}
