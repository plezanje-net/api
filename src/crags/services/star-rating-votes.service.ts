import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StarRatingVote } from '../entities/star-rating-vote.entity';

@Injectable()
export class StarRatingVotesService {
  constructor(
    @InjectRepository(StarRatingVote)
    private starRatingVoteRepository: Repository<StarRatingVote>,
  ) {}

  async find(routeIds: string[], currentUser: User): Promise<StarRatingVote[]> {
    return this.starRatingVoteRepository
      .createQueryBuilder('srv')
      .where('srv."userId" = :userId', { userId: currentUser.id })
      .andWhere('srv."routeId" IN (:...routeIds)', { routeIds })
      .getMany();
  }
}
