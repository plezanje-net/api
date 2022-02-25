import { Field, ObjectType } from '@nestjs/graphql';
import { Crag } from '../entities/crag.entity';
import { Route } from '../entities/route.entity';
import { Sector } from '../entities/sector.entity';
import { Comment } from '../entities/comment.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class SearchResults {
  @Field(() => [Crag], { nullable: true })
  crags?: Crag[];

  @Field(() => [Route], { nullable: true })
  routes?: Route[];

  @Field(() => [Sector], { nullable: true })
  sectors?: Sector[];

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @Field(() => [User], { nullable: true })
  users?: User[];
}
