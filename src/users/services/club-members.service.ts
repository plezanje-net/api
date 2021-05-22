import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClubMemberInput } from '../dtos/create-club-member.input';
import { ClubMember } from '../entities/club-member.entity';
import { Club } from '../entities/club.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ClubMembersService {
  constructor(
    @InjectRepository(ClubMember)
    private clubMembersRepository: Repository<ClubMember>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,
  ) {}

  async findByClub(clubId: string): Promise<ClubMember[]> {
    return this.clubMembersRepository.find({ where: { club: clubId } });
  }

  async nrMembersByClub(clubId: string): Promise<number> {
    return this.clubMembersRepository.count({
      where: { club: clubId },
    });
  }

  async findByUser(userId: string): Promise<ClubMember[]> {
    return this.clubMembersRepository.find({ where: { user: userId } });
  }

  async create(
    currentUser: User,
    data: CreateClubMemberInput,
  ): Promise<ClubMember> {
    // only if the logged in user is admin of this club can she add a member
    const currentUserAsAdminClubMember = await this.clubMembersRepository.findOne(
      {
        where: {
          club: data.clubId,
          user: currentUser.id,
          admin: true,
        },
      },
    );
    if (!currentUserAsAdminClubMember) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const clubMember = new ClubMember();
    clubMember.user = Promise.resolve(
      await this.usersRepository.findOneOrFail(data.userId),
    );

    clubMember.club = Promise.resolve(
      await this.clubRepository.findOneOrFail(data.clubId),
    );
    clubMember.admin = data.admin;

    return this.clubMembersRepository.save(clubMember);
  }

  async delete(currentUser: User, id: string): Promise<boolean> {
    // only if the logged in user is admin of this club can she remove a member
    const clubMember = await this.clubMembersRepository.findOneOrFail(id);
    const clubId = (await clubMember.club).id;
    const currentUserAsAdminClubMember = await this.clubMembersRepository.findOne(
      {
        where: {
          club: clubId,
          user: currentUser.id,
          admin: true,
        },
      },
    );
    if (!currentUserAsAdminClubMember) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return this.clubMembersRepository.remove(clubMember).then(() => true);
  }
}
