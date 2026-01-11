import { Field, ObjectType } from '@nestjs/graphql';
import { Pagination } from '../../core/interfaces/pagination.interface';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { Route } from '../entities/route.entity';

@ObjectType()
export class PaginatedRoutes implements Pagination<Route> {
  @Field(() => [Route])
  items: Route[];
  @Field()
  meta: PaginationMeta;
}
