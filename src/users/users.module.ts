import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersResolver } from './resolvers/users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { Club } from './entities/club.entity';
import { ClubMember } from './entities/club-member.entity';
import { ClubsService } from './services/clubs.service';
import { ClubsResolver } from './resolvers/clubs.resolver';
import { ClubMembersService } from './services/club-members.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Club, ClubMember]),
    forwardRef(() => AuthModule),
    NotificationModule,
  ],
  providers: [
    UsersService,
    UsersResolver,
    ClubsService,
    ClubsResolver,
    ClubMembersService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
