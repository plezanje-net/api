import { Field, ObjectType } from '@nestjs/graphql';
import { ActivityRoute } from '../entities/activity-route.entity';

@ObjectType()
export class RoutesTouches {
  @Field(type => [ActivityRoute])
  tried: ActivityRoute[];

  @Field(type => [ActivityRoute])
  ticked: ActivityRoute[];

  @Field(type => [ActivityRoute])
  trTicked: ActivityRoute[];
}
