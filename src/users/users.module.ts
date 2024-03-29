import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersResolver } from './resolvers/users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { NotificationModule } from '../notification/notification.module';
import { Club } from './entities/club.entity';
import { ClubMember } from './entities/club-member.entity';
import { ClubsService } from './services/clubs.service';
import { ClubsResolver } from './resolvers/clubs.resolver';
import { ClubMembersService } from './services/club-members.service';
import { ClubMembersResolver } from './resolvers/club-members.resolver';
import { UserLoader } from './loaders/user.loader';
import { AuditModule } from '../audit/audit.module';
import { ActivitiesModule } from '../activities/activities.module';
import { CragsModule } from '../crags/crags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Club, ClubMember]),
    AuthModule,
    NotificationModule,
    forwardRef(() => AuditModule),
    forwardRef(() => ActivitiesModule),
    CragsModule,
  ],
  providers: [
    UsersService,
    UsersResolver,
    ClubsService,
    ClubsResolver,
    ClubMembersService,
    ClubMembersResolver,
    UserLoader,
  ],
  exports: [UsersService, ClubMembersService],
})
export class UsersModule {}
