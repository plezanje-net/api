import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Route } from '../entities/route.entity';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UseInterceptors, UseFilters } from '@nestjs/common';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { NotFoundFilter } from '../filters/not-found.filter';
import { CreateRouteInput } from '../dtos/create-route.input';
import { UpdateRouteInput } from '../dtos/update-route.input';
import { RoutesService } from '../services/routes.service';
import { CommentsService } from '../services/comments.service';
import { Comment } from '../entities/comment.entity';
import { DifficultyVote } from '../entities/difficulty-vote.entity';
import { Pitch } from '../entities/pitch.entity';
import { PitchesService } from '../services/pitches.service';
import { RouteCommentsLoader } from '../loaders/route-comments.loader';
import DataLoader from 'dataloader';
import { Loader } from '../../core/interceptors/data-loader.interceptor';
import { RoutePitchesLoader } from '../loaders/route-pitches.loader';
import { DifficultyVotesService } from '../services/difficulty-votes.service';

@Resolver(() => Route)
export class RoutesResolver {
  constructor(
    private routesService: RoutesService,
    private commentsService: CommentsService,
    private pitchesService: PitchesService,
    private difficultyVotesService: DifficultyVotesService,
  ) {}

  @Mutation(() => Route)
  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter)
  async createRoute(
    @Args('input', { type: () => CreateRouteInput }) input: CreateRouteInput,
  ): Promise<Route> {
    return this.routesService.create(input);
  }

  @Mutation(() => Route)
  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter)
  async updateRoute(
    @Args('input', { type: () => UpdateRouteInput }) input: UpdateRouteInput,
  ): Promise<Route> {
    return this.routesService.update(input);
  }

  @Mutation(() => Boolean)
  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter)
  async deleteRoute(@Args('id') id: string): Promise<boolean> {
    return this.routesService.delete(id);
  }

  @Query(() => Route)
  @UseFilters(NotFoundFilter)
  async route(@Args('id') id: string): Promise<Route> {
    return this.routesService.findOneById(id);
  }

  @ResolveField('comments', () => [Comment])
  async getComments(
    @Parent() route: Route,
    @Loader(RouteCommentsLoader)
    loader: DataLoader<Comment['id'], Comment[]>,
  ): Promise<Comment[]> {
    return loader.load(route.id);
  }

  @ResolveField('difficultyVotes', () => [DifficultyVote])
  async difficultyVotes(@Parent() route: Route): Promise<DifficultyVote[]> {
    return this.difficultyVotesService.findByRouteId(route.id);
  }

  @ResolveField('pitches', () => [Pitch])
  async pitches(
    @Parent() route: Route,
    @Loader(RoutePitchesLoader)
    loader: DataLoader<Pitch['id'], Pitch[]>,
  ): Promise<Pitch[]> {
    return loader.load(route.id);
  }
}
