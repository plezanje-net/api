import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CreateClubMemberInput } from '../dtos/create-club-member.input';
import { ClubMember } from '../entities/club-member.entity';
import { User } from '../entities/user.entity';
import { ClubMembersService } from '../services/club-members.service';

@Resolver(of => ClubMember)
export class ClubMembersResolver {
  constructor(private clubMembersService: ClubMembersService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => ClubMember)
  async createClubMember(
    @CurrentUser() user: User,
    @Args('input', { type: () => CreateClubMemberInput })
    createClubMemberInput: CreateClubMemberInput,
  ): Promise<ClubMember> {
    return this.clubMembersService.create(user, createClubMemberInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async deleteClubMember(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.clubMembersService.delete(user, id);
  }
}
