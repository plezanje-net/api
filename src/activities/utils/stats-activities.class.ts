import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StatsActivities {
  @Field(() => Int)
  year: number;

  @Field(() => Int)
  nr_activities: number;

  @Field(() => String)
  type: string;

}
