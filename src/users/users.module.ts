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

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Club, ClubMember]), forwardRef(() => AuthModule), NotificationModule],
  providers: [UsersService, UsersResolver],
  exports: [UsersService]
})
export class UsersModule { }
