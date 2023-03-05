import { Field, ObjectType } from '@nestjs/graphql';
import { Pagination } from '../../core/interfaces/pagination.interface';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { DifficultyVote } from '../entities/difficulty-vote.entity';

@ObjectType()
export class PaginatedDifficultyVotes implements Pagination<DifficultyVote> {
  @Field(() => [DifficultyVote])
  items: DifficultyVote[];
  @Field()
  meta: PaginationMeta;
}
