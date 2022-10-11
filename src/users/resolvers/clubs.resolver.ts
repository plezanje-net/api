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
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';

@Resolver((of) => Club)
export class ClubsResolver {
  constructor(
    private clubsService: ClubsService,
    private clubMembersService: ClubMembersService,
  ) {}

  @UseGuards(UserAuthGuard)
  @Query((returns) => [Club], { name: 'myClubs' })
  async myClubs(@CurrentUser() user: User) {
    return this.clubsService.findAll(user.id);
  }

  @Roles('admin')
  @Query((returns) => [Club], { name: 'clubs' })
  async findAll(@Args('userId', { nullable: true }) userId?: string) {
    return this.clubsService.findAll(userId);
  }

  @UseGuards(UserAuthGuard)
  @Query((returns) => Club, { name: 'club' })
  async findOne(@CurrentUser() user: User, @Args('id') id: string) {
    return this.clubsService.findOne(user, id);
  }

  @UseGuards(UserAuthGuard)
  @Query((returns) => Club, { name: 'clubBySlug' })
  async findClubBySlug(
    @CurrentUser() user: User,
    @Args('slug') slug: string,
  ): Promise<Club> {
    return this.clubsService.findOneBySlug(user, slug);
  }

  @ResolveField('members', (returns) => [ClubMember])
  async getClubMembers(@Parent() club: Club) {
    return this.clubMembersService.findByClub(club.id);
  }

  @ResolveField('nrMembers', (returns) => Number)
  async getNumberOfClubMembers(@Parent() club: Club) {
    return this.clubMembersService.nrMembersByClub(club.id);
  }

  @UseGuards(UserAuthGuard)
  @Mutation((returns) => Club)
  async createClub(
    @CurrentUser() user: User,
    @Args('createClubInput') createClubInput: CreateClubInput,
  ): Promise<Club> {
    return this.clubsService.create(user, createClubInput);
  }

  @UseGuards(UserAuthGuard)
  @Mutation((returns) => Club)
  async updateClub(
    @CurrentUser() user: User,
    @Args('updateClubInput') updateClubInput: UpdateClubInput,
  ): Promise<Club> {
    return this.clubsService.update(user, updateClubInput);
  }

  @UseGuards(UserAuthGuard)
  @Mutation((returns) => Boolean)
  async deleteClub(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.clubsService.delete(user, id);
  }
}
