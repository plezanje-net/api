import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { NotificationService } from '../../notification/services/notification.service';
import { ConfirmInput } from '../dtos/confirm.input';
import { CreateClubMemberByEmailInput } from '../dtos/create-club-member-by-email.input';
import { CreateClubMemberInput } from '../dtos/create-club-member.input';
import { ClubMember } from '../entities/club-member.entity';
import { Club } from '../entities/club.entity';
import { User } from '../entities/user.entity';
import { ClubMembersService } from '../services/club-members.service';

@Resolver(of => ClubMember)
export class ClubMembersResolver {
  constructor(
    private clubMembersService: ClubMembersService,
    private notificationService: NotificationService,
  ) {}

  @UseGuards(UserAuthGuard)
  @Mutation(returns => ClubMember)
  async createClubMember(
    @CurrentUser() user: User,
    @Args('input', { type: () => CreateClubMemberInput })
    createClubMemberInput: CreateClubMemberInput,
  ): Promise<ClubMember> {
    return this.clubMembersService.createByUserId(user, createClubMemberInput);
  }

  @UseGuards(UserAuthGuard)
  @Mutation(returns => ClubMember)
  async createClubMemberByEmail(
    @CurrentUser() user: User,
    @Args('input', { type: () => CreateClubMemberByEmailInput })
    createClubMemberByEmailInput: CreateClubMemberByEmailInput,
  ): Promise<ClubMember> {
    const clubMember = await this.clubMembersService.createByUserEmail(
      user,
      createClubMemberByEmailInput,
    );
    if (
      !(await this.notificationService.clubMembershipConfirmation(
        user,
        clubMember,
      ))
    ) {
      this.clubMembersService.delete(user, clubMember.id);
      throw new InternalServerErrorException(500, 'email_error');
    }

    return Promise.resolve(clubMember);
  }

  @Mutation(returns => Club)
  async confirmClubMembership(
    @Args('input', { type: () => ConfirmInput }) input: ConfirmInput,
  ): Promise<Club> {
    return this.clubMembersService.confirmClubMembership(input);
  }

  @UseGuards(UserAuthGuard)
  @Mutation(returns => Boolean)
  async deleteClubMember(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.clubMembersService.delete(user, id);
  }
}
