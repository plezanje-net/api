import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CreateClubInput } from '../dtos/create-club.input';
import { UpdateClubInput } from '../dtos/update-club.input';
import { ClubsService } from '../services/clubs.service';
import { Club } from '../entities/club.entity';
import { ClubMember } from '../entities/club-member.entity';
import { ClubMembersService } from '../services/club-members.service';

@Resolver(() => Club)
export class ClubsResolver {
  constructor(
    private clubsService: ClubsService,
    private clubMembersService: ClubMembersService,
  ) {}

  // // TODO: this is a stub
  // @Mutation(() => Club)
  // createClub(@Args('createClubInput') createClubInput: CreateClubInput) {
  //   return this.clubsService.create(createClubInput);
  // }

  @Query(() => [Club], { name: 'clubs' })
  async findAll() {
    return this.clubsService.findAll();
  }

  @Query(() => Club, { name: 'club' })
  async findOne(@Args('id') id: string) {
    return this.clubsService.findOne(id);
  }

  @ResolveField('members', returns => [ClubMember])
  async getClubMembers(@Parent() club: Club) {
    return this.clubMembersService.findByClub(club.id);
  }

  // // TODO: this is a stub
  // @Mutation(() => Club)
  // updateClub(@Args('updateClubInput') updateClubInput: UpdateClubInput) {
  //   return this.clubsService.update(updateClubInput.id, updateClubInput);
  // }

  // // TODO: this is a stub
  // @Mutation(() => Club)
  // removeClub(@Args('id', { type: () => Int }) id: number) {
  //   return this.clubsService.remove(id);
  // }
}
