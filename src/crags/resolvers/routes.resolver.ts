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
import { EntityStatus } from '../entities/enums/entity-status.enum';

@Resolver(() => Route)
export class RoutesResolver {
  constructor(
    private routesService: RoutesService,
    private commentsService: CommentsService,
    private pitchesService: PitchesService,
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
    @MinCragStatus() minStatus: EntityStatus,
  ): Promise<Route> {
    return this.routesService.findOneBySlug(cragSlug, routeSlug, minStatus);
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
    if (!user.isAdmin() && !['user', 'proposal'].includes(input.status)) {
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

    if (!user.isAdmin() && !['user', 'proposal'].includes(route.status)) {
      throw new ForbiddenException();
    }

    if (
      !user.isAdmin() &&
      input.status != null &&
      !['user', 'proposal'].includes(input.status)
    ) {
      throw new BadRequestException();
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

    if (!user.isAdmin() && !['user', 'proposal'].includes(route.status)) {
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
}
