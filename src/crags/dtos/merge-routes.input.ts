import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class MergeRoutesInput {
  @Field()
  sourceRouteId: string;

  @Field()
  targetRouteId: string;
}
