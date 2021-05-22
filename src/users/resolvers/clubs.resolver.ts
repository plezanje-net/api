import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CreateClubInput } from '../dtos/create-club.input';
import { UpdateClubInput } from '../dtos/update-club.input';
import { ClubsService } from '../services/clubs.service';
import { Club } from '../entities/club.entity';
import { ClubMember } from '../entities/club-member.entity';
import { ClubMembersService } from '../services/club-members.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Resolver(of => Club)
export class ClubsResolver {
  constructor(
    private clubsService: ClubsService,
    private clubMembersService: ClubMembersService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(returns => [Club], { name: 'myClubs' })
  async myClubs(@CurrentUser() user: User) {
    return this.clubsService.findAll(user.id);
  }

  @Roles('admin')
  @Query(returns => [Club], { name: 'clubs' })
  async findAll(@Args('userId', { nullable: true }) userId?: string) {
    return this.clubsService.findAll(userId);
  }

  @Query(returns => Club, { name: 'club' })
  async findOne(@Args('id') id: string) {
    return this.clubsService.findOne(id);
  }

  @ResolveField('members', returns => [ClubMember])
  async getClubMembers(@Parent() club: Club) {
    return this.clubMembersService.findByClub(club.id);
  }

  @ResolveField('nrMembers', returns => Number)
  async getNumberOfClubMembers(@Parent() club: Club) {
    return this.clubMembersService.nrMembersByClub(club.id);
  }

  @Roles('admin')
  @Mutation(returns => Club)
  async createClub(
    @Args('createClubInput') createClubInput: CreateClubInput,
  ): Promise<Club> {
    return this.clubsService.create(createClubInput);
  }

  @Roles('admin')
  @Mutation(returns => Club)
  async updateClub(
    @Args('updateClubInput') updateClubInput: UpdateClubInput,
  ): Promise<Club> {
    return this.clubsService.update(updateClubInput);
  }

  @Roles('admin')
  @Mutation(returns => Boolean)
  async deleteClub(@Args('id') id: string): Promise<boolean> {
    return this.clubsService.delete(id);
  }
}
