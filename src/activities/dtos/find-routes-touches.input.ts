import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class FindRoutesTouchesInput {
  @Field(type => [String])
  routeIds: string[];

  @Field(type => String)
  userId: string;

  @Field(type => Date)
  before: Date;

  constructor(routeIds: string[], userId: string, before: Date) {
    this.routeIds = routeIds;
    this.userId = userId;
    this.before = before;
  }
}
