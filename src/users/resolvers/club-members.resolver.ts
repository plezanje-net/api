import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateClubMemberByEmailInput } from '../dtos/create-club-member-by-email.input';
import { CreateClubMemberInput } from '../dtos/create-club-member.input';
import { ClubMember } from '../entities/club-member.entity';
import { User } from '../entities/user.entity';
import { ClubMembersService } from '../services/club-members.service';

@Resolver(of => ClubMember)
export class ClubMembersResolver {
  constructor(private clubMembersService: ClubMembersService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(returns => ClubMember)
  async createClubMember(
    @CurrentUser() user: User,
    @Args('input', { type: () => CreateClubMemberInput })
    createClubMemberInput: CreateClubMemberInput,
  ): Promise<ClubMember> {
    return this.clubMembersService.createByUserId(user, createClubMemberInput);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(returns => ClubMember)
  async createClubMemberByEmail(
    @CurrentUser() user: User,
    @Args('input', { type: () => CreateClubMemberByEmailInput })
    createClubMemberByEmailInput: CreateClubMemberByEmailInput,
  ): Promise<ClubMember> {
    return this.clubMembersService.createByUserEmail(
      user,
      createClubMemberByEmailInput,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(returns => Boolean)
  async deleteClubMember(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.clubMembersService.delete(user, id);
  }
}
