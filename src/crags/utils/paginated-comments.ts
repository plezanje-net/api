import { Field, ObjectType } from '@nestjs/graphql';
import { Pagination } from '../../core/interfaces/pagination.interface';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { Comment } from '../entities/comment.entity';

@ObjectType()
export class PaginatedComments implements Pagination<Comment> {
  @Field(() => [Comment])
  items: Comment[];
  @Field()
  meta: PaginationMeta;
}
