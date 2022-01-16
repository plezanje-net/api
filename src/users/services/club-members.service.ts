import {
  HttpException,
  HttpStatus,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { ConfirmInput } from '../dtos/confirm.input';
import { CreateClubMemberByEmailInput } from '../dtos/create-club-member-by-email.input';
import { CreateClubMemberInput } from '../dtos/create-club-member.input';
import { ClubMember, ClubMemberStatus } from '../entities/club-member.entity';
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

  async createByUserEmail(
    currentUser: User,
    data: CreateClubMemberByEmailInput,
  ): Promise<ClubMember> {
    // only if the logged in user is admin of this club can she add a member
    if (!(await this.isMemberAdmin(data.clubId, currentUser.id))) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    // get user that we are adding as a new member
    const newMemberUser = Promise.resolve(
      await this.usersRepository.findOneOrFail({
        where: {
          email: data.userEmail,
        },
      }),
    );

    return this.addUserToClub(newMemberUser, data.clubId, data.admin);
  }

  private async addUserToClub(
    newMemberUser: Promise<User>,
    clubId: string,
    asAdmin: boolean,
  ): Promise<ClubMember> {
    const clubMember = new ClubMember();

    clubMember.user = newMemberUser;

    clubMember.club = Promise.resolve(
      await this.clubRepository.findOneOrFail(clubId),
    );

    clubMember.admin = asAdmin;

    clubMember.status = ClubMemberStatus.PENDING;
    clubMember.confirmationToken = randomBytes(20).toString('hex');

    return this.clubMembersRepository.save(clubMember);
  }

  async confirmClubMembership(confirmIn: ConfirmInput): Promise<Club> {
    const clubMember = await this.clubMembersRepository.findOneOrFail(
      confirmIn.id,
    );

    if (clubMember.confirmationToken != confirmIn.token) {
      throw new NotAcceptableException();
    }

    clubMember.confirmationToken = null;
    clubMember.status = ClubMemberStatus.ACTIVE;

    await this.clubMembersRepository.save(clubMember);

    return clubMember.club;
  }

  async delete(currentUser: User, id: string): Promise<boolean> {
    // only if the logged in user is admin of this club can she remove a member
    const clubMember = await this.clubMembersRepository.findOneOrFail(id);
    const clubId = (await clubMember.club).id;
    if (!(await this.isMemberAdmin(clubId, currentUser.id)))
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    return this.clubMembersRepository.remove(clubMember).then(() => true);
  }

  async createByUserId(
    currentUser: User,
    data: CreateClubMemberInput,
  ): Promise<ClubMember> {
    // only if the logged in user is admin of this club can she add a member
    if (!(await this.isMemberAdmin(data.clubId, currentUser.id)))
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    // get user that we are adding as a new member
    const newMemberUser = Promise.resolve(
      await this.usersRepository.findOneOrFail(data.userId),
    );

    return this.addUserToClub(newMemberUser, data.clubId, data.admin);
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
