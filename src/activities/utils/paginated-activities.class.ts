import { Field, ObjectType } from '@nestjs/graphql';
import { Pagination } from '../../core/interfaces/pagination.interface';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { Activity } from '../entities/activity.entity';

@ObjectType()
export class PaginatedActivities implements Pagination<Activity> {
  @Field(() => [Activity])
  items: Activity[];
  @Field()
  meta: PaginationMeta;
}
