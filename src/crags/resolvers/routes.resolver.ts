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
import { UseInterceptors, UseFilters, UseGuards } from '@nestjs/common';
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
import { MinCragStatus } from '../decorators/min-crag-status.decorator';
import { Crag, CragStatus } from '../entities/crag.entity';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { ForeignKeyConstraintFilter } from '../filters/foreign-key-constraint.filter';
import { GradingSystem } from '../entities/grading-system.entity';
import { GradingSystemLoader } from '../loaders/grading-system.loader';
import { RouteType } from '../entities/route-type.entity';
import { RouteTypeLoader } from '../loaders/route-type.loader';
import { CragLoader } from '../loaders/crag.loader';
import { RouteProperty } from '../entities/route-property.entity';
import { EntityPropertiesService } from '../services/entity-properties.service';
import { ActivityRoutesService } from '../../activities/services/activity-routes.service';

@Resolver(() => Route)
export class RoutesResolver {
  constructor(
    private routesService: RoutesService,
    private difficultyVotesService: DifficultyVotesService,
    private entityPropertiesService: EntityPropertiesService,
    private activityRoutesService: ActivityRoutesService,
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

  @Mutation(() => [Route])
  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter)
  async updateRoutes(
    @Args('input', { type: () => [UpdateRouteInput] })
    input: UpdateRouteInput[],
  ): Promise<Route[]> {
    return Promise.all(input.map(input => this.routesService.update(input)));
  }

  @Mutation(() => Boolean)
  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter, ForeignKeyConstraintFilter)
  async deleteRoute(@Args('id') id: string): Promise<boolean> {
    return this.routesService.delete(id);
  }

  @Query(() => Route)
  @UseFilters(NotFoundFilter)
  async route(@Args('id') id: string): Promise<Route> {
    return this.routesService.findOneById(id);
  }

  @Query(() => Route)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  async routeBySlug(
    @Args('cragSlug') cragSlug: string,
    @Args('routeSlug') routeSlug: string,
    @MinCragStatus() minStatus: CragStatus,
  ): Promise<Route> {
    return this.routesService.findOneBySlug(cragSlug, routeSlug, minStatus);
  }

  @ResolveField('comments', () => [Comment])
  async getComments(
    @Parent() route: Route,
    @Loader(RouteCommentsLoader)
    loader: DataLoader<Comment['id'], Comment[]>,
  ): Promise<Comment[]> {
    return loader.load(route.id);
  }

  @ResolveField('properties', () => [RouteProperty])
  async getProperties(@Parent() route: Route): Promise<RouteProperty[]> {
    return this.entityPropertiesService.getRouteProperties(route);
  }

  @ResolveField('difficultyVotes', () => [DifficultyVote])
  async difficultyVotes(@Parent() route: Route): Promise<DifficultyVote[]> {
    return this.difficultyVotesService.findByRouteId(route.id);
  }

  @ResolveField('crag', () => Crag)
  async getCrag(
    @Parent() route: Route,
    @Loader(CragLoader)
    loader: DataLoader<Crag['id'], Crag>,
  ): Promise<Crag> {
    return loader.load(route.cragId);
  }

  @ResolveField('pitches', () => [Pitch])
  async pitches(
    @Parent() route: Route,
    @Loader(RoutePitchesLoader)
    loader: DataLoader<Pitch['id'], Pitch[]>,
  ): Promise<Pitch[]> {
    return loader.load(route.id);
  }

  @ResolveField('defaultGradingSystem', () => GradingSystem)
  async defaultGradingSystem(
    @Parent() route: Route,
    @Loader(GradingSystemLoader)
    loader: DataLoader<GradingSystem['id'], GradingSystem>,
  ): Promise<GradingSystem> {
    return loader.load(route.defaultGradingSystemId);
  }

  @ResolveField('routeType', () => RouteType)
  async routeType(
    @Parent() route: Route,
    @Loader(RouteTypeLoader)
    loader: DataLoader<RouteType['id'], RouteType>,
  ): Promise<RouteType> {
    return loader.load(route.routeTypeId);
  }

  @ResolveField('nrTicks', returns => Number)
  async nrTicks(@Parent() route: Route) {
    return this.activityRoutesService.countTicks(route);
  }

  @ResolveField('nrTries', returns => Number)
  async nrTries(@Parent() route: Route) {
    return this.activityRoutesService.countTries(route);
  }

  @ResolveField('nrClimbers', returns => Number)
  async nrClimbers(@Parent() route: Route) {
    return this.activityRoutesService.countDisctinctClimbers(route);
  }
}
