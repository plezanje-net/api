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
import {
  UseInterceptors,
  UseFilters,
  UseGuards,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { NotFoundFilter } from '../filters/not-found.filter';
import { CreateRouteInput } from '../dtos/create-route.input';
import { UpdateRouteInput } from '../dtos/update-route.input';
import { RoutesService } from '../services/routes.service';
import { Comment } from '../entities/comment.entity';
import { DifficultyVote } from '../entities/difficulty-vote.entity';
import { Pitch } from '../entities/pitch.entity';
import { RouteCommentsLoader } from '../loaders/route-comments.loader';
import DataLoader from 'dataloader';
import { Loader } from '../../core/interceptors/data-loader.interceptor';
import { RoutePitchesLoader } from '../loaders/route-pitches.loader';
import { DifficultyVotesService } from '../services/difficulty-votes.service';
import { Crag } from '../entities/crag.entity';
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
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { RouteNrTicksLoader } from '../loaders/route-nr-ticks.loader';
import { RouteNrTriesLoader } from '../loaders/route-nr-tries.loader';
import { RouteNrClimbersLoader } from '../loaders/route-nr-climbers.loader';

@Resolver(() => Route)
export class RoutesResolver {
  constructor(
    private routesService: RoutesService,
    private difficultyVotesService: DifficultyVotesService,
    private entityPropertiesService: EntityPropertiesService,
  ) {}

  /* QUERIES */

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
    @CurrentUser() user: User,
  ): Promise<Route> {
    return this.routesService.findOneBySlug(cragSlug, routeSlug, user);
  }

  /* MUTATIONS */

  @Mutation(() => Route)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter)
  async createRoute(
    @Args('input', { type: () => CreateRouteInput }) input: CreateRouteInput,
    @CurrentUser() user: User,
  ): Promise<Route> {
    if (!user.isAdmin() && input.publishStatus == 'published') {
      throw new BadRequestException();
    }
    return this.routesService.create(input, user);
  }

  @Mutation(() => Route)
  @UseGuards(UserAuthGuard)
  @UseFilters(NotFoundFilter)
  @UseInterceptors(AuditInterceptor)
  async updateRoute(
    @Args('input', { type: () => UpdateRouteInput }) input: UpdateRouteInput,
    @CurrentUser() user: User,
  ): Promise<Route> {
    const route = await this.routesService.findOne({
      id: input.id,
      user,
    });

    if (!user.isAdmin() && route.publishStatus != 'draft') {
      throw new ForbiddenException();
    }

    if (!user.isAdmin() && input.publishStatus == 'published') {
      throw new BadRequestException('publish_status_unavailable_to_user');
    }

    const sector = await route.sector;
    if (
      input.publishStatus != null &&
      sector.publishStatus < input.publishStatus
    ) {
      throw new BadRequestException('publish_status_incompatible_with_sector');
    }

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
  @UseGuards(UserAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter, ForeignKeyConstraintFilter)
  async deleteRoute(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const route = await this.routesService.findOne({
      id: id,
      user,
    });

    if (!user.isAdmin() && route.publishStatus != 'draft') {
      throw new ForbiddenException();
    }

    return this.routesService.delete(id);
  }

  /* FIELDS */

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
  async nrTicks(
    @Parent() route: Route,
    @Loader(RouteNrTicksLoader) loader: DataLoader<string, number>,
  ) {
    return loader.load(route.id);
  }

  @ResolveField('nrTries', returns => Number)
  async nrTries(
    @Parent() route: Route,
    @Loader(RouteNrTriesLoader) loader: DataLoader<string, number>,
  ) {
    return loader.load(route.id);
  }

  @ResolveField('nrClimbers', returns => Number)
  async nrClimbers(
    @Parent() route: Route,
    @Loader(RouteNrClimbersLoader) loader: DataLoader<string, number>,
  ) {
    return loader.load(route.id);
  }
}
