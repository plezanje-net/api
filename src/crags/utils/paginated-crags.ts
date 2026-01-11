import { Field, ObjectType } from '@nestjs/graphql';
import { Pagination } from '../../core/interfaces/pagination.interface';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { Crag } from '../entities/crag.entity';

@ObjectType()
export class PaginatedCrags implements Pagination<Crag> {
  @Field(() => [Crag])
  items: Crag[];
  @Field()
  meta: PaginationMeta;
}
