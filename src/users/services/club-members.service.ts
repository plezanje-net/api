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
    return this.clubMembersRepository.find({ where: { clubId: clubId } });
  }

  async nrMembersByClub(clubId: string): Promise<number> {
    return this.clubMembersRepository.count({
      where: { clubId: clubId },
    });
  }

  async findByUser(userId: string): Promise<ClubMember[]> {
    return this.clubMembersRepository.find({ where: { userId: userId } });
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
      await this.clubRepository.findOneByOrFail({ id: clubId }),
    );

    clubMember.admin = asAdmin;

    clubMember.status = ClubMemberStatus.PENDING;
    clubMember.confirmationToken = randomBytes(20).toString('hex');

    return this.clubMembersRepository.save(clubMember);
  }

  async confirmClubMembership(confirmIn: ConfirmInput): Promise<Club> {
    const clubMember = await this.clubMembersRepository.findOneByOrFail({
      id: confirmIn.id,
    });

    if (clubMember.confirmationToken != confirmIn.token) {
      throw new NotAcceptableException();
    }

    clubMember.confirmationToken = null;
    clubMember.status = ClubMemberStatus.ACTIVE;

    await this.clubMembersRepository.save(clubMember);

    return clubMember.club;
  }

  async delete(currentUser: User, id: string): Promise<boolean> {
    // only if the logged in user is admin of this club or if the user is deleting herself can she remove a member
    const clubMember = await this.clubMembersRepository.findOneByOrFail({ id });
    const clubId = (await clubMember.club).id;
    if (
      !(await this.isMemberAdmin(clubId, currentUser.id)) &&
      currentUser.id != clubMember.userId
    ) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

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
      await this.usersRepository.findOneByOrFail({ id: data.userId }),
    );

    return this.addUserToClub(newMemberUser, data.clubId, data.admin);
  }

  private async isMemberAdmin(
    clubId: string,
    userId: string,
  ): Promise<boolean> {
    const currentUserAsAdminClubMember =
      await this.clubMembersRepository.findOne({
        where: {
          clubId: clubId,
          userId: userId,
          admin: true,
        },
      });
    if (currentUserAsAdminClubMember) {
      return true;
    }
    return false;
  }
}
