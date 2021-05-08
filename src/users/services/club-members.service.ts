import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubMember } from '../entities/club-member.entity';

@Injectable()
export class ClubMembersService {
  constructor(
    @InjectRepository(ClubMember)
    private clubMembersRepository: Repository<ClubMember>,
  ) {}

  findByClub(clubId: string): Promise<ClubMember[]> {
    return this.clubMembersRepository.find({ where: { club: clubId } });
  }
}
