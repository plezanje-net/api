import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClubInput } from '../dtos/create-club.input';
import { UpdateClubInput } from '../dtos/update-club.input';
import { ClubMember } from '../entities/club-member.entity';
import { Club } from '../entities/club.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club) private clubsRepository: Repository<Club>,
    @InjectRepository(ClubMember)
    private clubMembersRepository: Repository<ClubMember>,
  ) {}

  async findAll(userId?: string): Promise<Club[]> {
    if (userId) {
      return this.clubsRepository
        .createQueryBuilder('club')
        .leftJoinAndSelect('club.members', 'member')
        .where('"member"."userId" = :userId', { userId })
        .getMany();
    } else {
      return this.clubsRepository.find();
    }
  }

  async findOne(user: User, id: string): Promise<Club> {
    const club = await this.clubsRepository.findOneOrFail(id);

    // only club member can see club data
    const clubMember = await this.clubMembersRepository.findOne({
      where: { user: user.id, club: id },
    });
    if (!clubMember) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    return club;
  }

  async create(data: CreateClubInput): Promise<Club> {
    return this.clubsRepository.create(data).save();
  }

  async update(currentUser: User, data: UpdateClubInput): Promise<Club> {
    const club = await this.clubsRepository.findOneOrFail(data.id);

    // only if the logged in user is admin of this club can she update the club
    if (!(await this.isMemberAdmin(data.id, currentUser.id)))
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    this.clubsRepository.merge(club, data);

    return this.clubsRepository.save(club);
  }

  async delete(id: string): Promise<boolean> {
    const club = await this.clubsRepository.findOneOrFail(id); // when a club is deleted all entries reffering to the club in pivot are also deleted
    return this.clubsRepository.remove(club).then(() => true);
  }

  private async isMemberAdmin(
    clubId: string,
    userId: string,
  ): Promise<boolean> {
    const currentUserAsAdminClubMember = await this.clubMembersRepository.findOne(
      {
        where: {
          club: clubId,
          user: userId,
          admin: true,
        },
      },
    );
    if (currentUserAsAdminClubMember) {
      return true;
    }
    return false;
  }
}
