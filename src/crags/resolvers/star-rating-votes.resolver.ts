import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { User } from '../../users/entities/user.entity';
import { StarRatingVote } from '../entities/star-rating-vote.entity';
import { StarRatingVotesService } from '../services/star-rating-votes.service';

@Resolver(of => StarRatingVote)
export class StarRatingVotesResolver {
  constructor(private starRatingVotesService: StarRatingVotesService) {}

  @UseGuards(UserAuthGuard)
  @Query(returns => [StarRatingVote], { name: 'starRatingVotes' })
  getStarRatingVotes(
    @CurrentUser() currentUser: User,
    @Args('routeIds', { type: () => [String] })
    routeIds?: string[],
  ): Promise<StarRatingVote[]> {
    return this.starRatingVotesService.find(routeIds, currentUser);
  }
}
