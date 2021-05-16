import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClubInput } from '../dtos/create-club.input';
import { UpdateClubInput } from '../dtos/update-club.input';
import { Club } from '../entities/club.entity';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club) private clubsRepository: Repository<Club>,
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

  async findOne(id: string): Promise<Club> {
    return this.clubsRepository.findOneOrFail(id);
  }

  async create(data: CreateClubInput): Promise<Club> {
    return this.clubsRepository.create(data).save();
  }

  async update(data: UpdateClubInput): Promise<Club> {
    const club = await this.clubsRepository.findOneOrFail(data.id);
    this.clubsRepository.merge(club, data);

    return this.clubsRepository.save(club);
  }

  async delete(id: string): Promise<boolean> {
    const club = await this.clubsRepository.findOneOrFail(id); // when a club is deleted all entries reffering to the club in pivot are also deleted
    return this.clubsRepository.remove(club).then(() => true);
  }
}
