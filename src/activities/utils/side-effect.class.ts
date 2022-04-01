import { Field, ObjectType } from '@nestjs/graphql';
import { ActivityRoute } from '../entities/activity-route.entity';

@ObjectType()
export class SideEffect {
  @Field(type => ActivityRoute)
  before: ActivityRoute;

  @Field(type => ActivityRoute)
  after: ActivityRoute;
}
