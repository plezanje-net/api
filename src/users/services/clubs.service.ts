import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
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

  async findOneBySlug(user: User, slug: string): Promise<Club> {
    const club = await this.clubsRepository.findOneOrFail({ where: { slug } });

    // only club member can see club data
    const clubMember = await this.clubMembersRepository.findOne({
      where: { user: user.id, club: club.id },
    });
    if (!clubMember) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    return club;
  }

  async create(currentUser: User, data: CreateClubInput): Promise<Club> {
    // generate slug from club name
    const clubName = data.name;
    let slug = slugify(clubName, { lower: true });
    let suffixCounter = 0;
    let suffix = '';
    while (
      (await this.clubsRepository.findOne({
        where: { slug: slug + suffix },
      })) !== undefined
    ) {
      suffixCounter++;
      suffix = '-' + suffixCounter;
    }
    slug += suffix;

    const newClub = await this.clubsRepository.create({ ...data, slug }).save();

    // user creating the club should be automatically added as an admin member, otherwise we would get an orphaned club
    const clubMember = new ClubMember();
    clubMember.user = Promise.resolve(currentUser);
    clubMember.club = Promise.resolve(newClub);
    clubMember.admin = true;
    this.clubMembersRepository.save(clubMember);

    return newClub;
  }

  async update(currentUser: User, data: UpdateClubInput): Promise<Club> {
    const club = await this.clubsRepository.findOneOrFail(data.id);

    // only if the logged in user is admin of this club can she update the club
    if (!(await this.isMemberAdmin(data.id, currentUser.id)))
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    this.clubsRepository.merge(club, data);

    return this.clubsRepository.save(club);
  }

  async delete(currentUser: User, id: string): Promise<boolean> {
    // only if the logged in user is admin of this club can she delete the club
    if (!(await this.isMemberAdmin(id, currentUser.id)))
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

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
