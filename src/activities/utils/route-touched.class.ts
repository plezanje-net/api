import { Field, ObjectType } from '@nestjs/graphql';

// Deprecated: Remove when query routeTouched is removed
@ObjectType()
export class RouteTouched {
  @Field()
  tried: boolean;

  @Field()
  ticked: boolean;
}
