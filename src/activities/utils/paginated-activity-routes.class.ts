import { Field, ObjectType } from '@nestjs/graphql';
import { Pagination } from '../../core/interfaces/pagination.interface';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { ActivityRoute } from '../entities/activity-route.entity';

@ObjectType()
export class PaginatedActivityRoutes implements Pagination<ActivityRoute> {
  @Field(() => [ActivityRoute])
  items: ActivityRoute[];
  @Field()
  meta: PaginationMeta;
}
