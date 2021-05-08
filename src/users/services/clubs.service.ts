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

  create(createClubInput: CreateClubInput) {
    return 'This action adds a new club';
  }

  findAll(): Promise<Club[]> {
    // return `This action returns all clubs`;

    return this.clubsRepository.find();
    // return [
    //   {
    //     id: 1,
    //     name: 'some club',
    //     created: new Date(),
    //     updated: new Date(),
    //     legacy: 'dafafgasdg',
    //     members: [{}],
    //   },
    // ];
  }

  findOne(id: string): Promise<Club> {
    // return `This action returns a #${id} club`;
    return this.clubsRepository.findOneOrFail(id);
  }

  update(id: number, updateClubInput: UpdateClubInput) {
    return `This action updates a #${id} club`;
  }

  remove(id: number) {
    return `This action removes a #${id} club`;
  }
}
