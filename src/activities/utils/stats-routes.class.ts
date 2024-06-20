import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StatsRoutes {
  @Field(() => Int)
  year: number;

  @Field(() => Float)
  difficulty: number;

  @Field(() => String)
  ascent_type: string;

  @Field(() => Int)
  nr_routes: number;

}
