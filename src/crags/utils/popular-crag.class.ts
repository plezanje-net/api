import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Crag } from '../entities/crag.entity';

@ObjectType()
export class PopularCrag {
  @Field(() => Int)
  nrVisits: number;

  @Field(() => Crag)
  crag: Crag;
}
