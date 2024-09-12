import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StarRatingVote } from '../entities/star-rating-vote.entity';
import { FindStarRatingVotesInput } from '../dtos/find-star-rating-votes.input';

@Injectable()
export class StarRatingVotesService {
  constructor(
    @InjectRepository(StarRatingVote)
    private starRatingVoteRepository: Repository<StarRatingVote>,
  ) {}

  async find(routeIds: string[], currentUser: User): Promise<StarRatingVote[]> {
    return this.starRatingVoteRepository
      .createQueryBuilder('srv')
      .where('srv.user_id = :userId', { userId: currentUser.id })
      .andWhere('srv.route_id IN (:...routeIds)', { routeIds })
      .getMany();
  }

  async findByRouteId(
    routeId: string,
    input: FindStarRatingVotesInput = {},
  ): Promise<StarRatingVote[]> {
    const where = {
      ...(input.userId && { userId: input.userId }),
      ...{ routeId },
    };

    return this.starRatingVoteRepository.find({
      where,
      order: { stars: 'ASC' },
    });
  }
}
