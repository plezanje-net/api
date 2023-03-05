import { Field, ObjectType } from '@nestjs/graphql';
import { Crag } from '../../crags/entities/crag.entity';
import { Route } from '../../crags/entities/route.entity';
import { Sector } from '../../crags/entities/sector.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Contribution {
  @Field(() => User, { nullable: true })
  user?: Promise<User>;
  userId?: string;

  @Field()
  entity: string;

  @Field()
  created: Date;

  @Field()
  id: string;

  @Field()
  publishStatus: string;

  @Field(() => Crag, { nullable: true })
  crag: Promise<Crag>;

  @Field(() => Sector, { nullable: true })
  sector: Promise<Sector>;

  @Field(() => Route, { nullable: true })
  route: Promise<Route>;
}
