import { Field, ObjectType } from '@nestjs/graphql';
import { Crag } from '../entities/crag.entity';
import { Route } from '../entities/route.entity';

@ObjectType()
export class SearchResult {
  @Field()
  name: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  crag?: Crag;

  @Field({ nullable: true })
  route?: Route;
}
