import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class FindRoutesTouchesInput {
  @Field(type => [String])
  routeIds: string[];

  @Field(type => Date)
  before: Date;

  constructor(routeIds: string[], before: Date) {
    this.routeIds = routeIds;
    this.before = before;
  }
}
