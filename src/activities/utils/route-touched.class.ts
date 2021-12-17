import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RouteTouched {
  @Field()
  tried: boolean;

  @Field()
  ticked: boolean;
}
