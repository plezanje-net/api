import { Field, ObjectType } from '@nestjs/graphql';
import { Crag } from '../entities/crag.entity';
import { Route } from '../entities/route.entity';
import { Sector } from '../entities/sector.entity';
import { Comment } from '../entities/comment.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class SearchResults {
  @Field(() => [Crag])
  crags: Crag[];

  @Field(() => [Route])
  routes: Route[];

  @Field(() => [Sector])
  sectors: Sector[];

  @Field(() => [Comment])
  comments: Comment[];

  @Field(() => [User])
  users: User[];
}
