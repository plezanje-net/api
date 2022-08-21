import {
  ForbiddenException,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  Args,
  Info,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { Loader } from '../../core/interceptors/data-loader.interceptor';
import { Route } from '../../crags/entities/route.entity';
import { NotFoundFilter } from '../../crags/filters/not-found.filter';
import { RouteLoader } from '../../crags/loaders/route.loader';
import { User } from '../../users/entities/user.entity';
import { UserLoader } from '../../users/loaders/user.loader';
import { FindActivityRoutesInput } from '../dtos/find-activity-routes.input';
import { ActivityRoute } from '../entities/activity-route.entity';
import { Activity } from '../entities/activity.entity';
import { ActivityLoader } from '../loaders/activity.loader';
import { ActivityRoutesService } from '../services/activity-routes.service';
import { PaginatedActivityRoutes } from '../utils/paginated-activity-routes.class';
import { GraphQLResolveInfo } from 'graphql';
import { CacheScope } from 'apollo-server-types';
import { CreateActivityRouteInput } from '../dtos/create-activity-route.input';
import { ActivitiesService } from '../services/activities.service';
import { UpdateActivityRouteInput } from '../dtos/update-activity-route.input';
import { FindRoutesTouchesInput } from '../dtos/find-routes-touches.input';
import { RoutesTouches } from '../utils/routes-touches.class';

@Resolver(() => ActivityRoute)
export class ActivityRoutesResolver {
  constructor(
    private activityRoutesService: ActivityRoutesService,
    private activitiesService: ActivitiesService,
  ) {}

  @Query(() => ActivityRoute)
  @UseFilters(NotFoundFilter)
  async activityRoute(@Args('id') id: string): Promise<ActivityRoute> {
    return this.activityRoutesService.findOneById(id);
  }

  @ResolveField('activity', () => Activity, { nullable: true })
  async getActivity(
    @Parent() activityRoute: ActivityRoute,
    @Loader(ActivityLoader)
    loader: DataLoader<Activity['id'], Activity>,
  ): Promise<Activity> {
    return activityRoute.activityId != null
      ? loader.load(activityRoute.activityId)
      : null;
  }

  @ResolveField('route', () => Route)
  async getRoute(
    @Parent() activityRoute: ActivityRoute,
    @Loader(RouteLoader)
    loader: DataLoader<Route['id'], Route>,
  ): Promise<Route> {
    return loader.load(activityRoute.routeId);
  }

  @ResolveField('user', () => User)
  async getUser(
    @Parent() activityRoute: ActivityRoute,
    @Loader(UserLoader)
    loader: DataLoader<ActivityRoute['userId'], User>,
  ): Promise<User> {
    return loader.load(activityRoute.userId);
  }

  /**
   * For an array of route ids check which routes has a user already tried, ticked or ticked on toprope before (or on) a given date
   */
  @UseGuards(UserAuthGuard)
  @Query(returns => RoutesTouches)
  async routesTouches(
    @CurrentUser() user: User,
    @Args('input') input: FindRoutesTouchesInput,
  ): Promise<RoutesTouches> {
    return await this.activityRoutesService.getTouchesForRoutes(input, user.id);
  }

  @UseGuards(UserAuthGuard)
  @Query(() => PaginatedActivityRoutes)
  myActivityRoutes(
    @CurrentUser() currentUser: User,
    @Args('input', { nullable: true }) input: FindActivityRoutesInput = {},
    @Info() info: GraphQLResolveInfo,
  ): Promise<PaginatedActivityRoutes> {
    info.cacheControl.setCacheHint({ scope: CacheScope.Private });

    // TODO: currentUser should serve as authorization filter (what is allowed to be returned)
    // userId in input should be renamed to forUserId, and be used as a result filter (what is the client asking for)
    input.userId = currentUser.id;
    return this.activityRoutesService.paginate(input, currentUser);
  }

  @UseGuards(UserAuthGuard)
  @Query(() => [ActivityRoute])
  myCragSummary(
    @CurrentUser() user: User,
    @Args('input', { nullable: true }) input: FindActivityRoutesInput = {},
    @Info() info: GraphQLResolveInfo,
  ): Promise<ActivityRoute[]> {
    info.cacheControl.setCacheHint({ scope: CacheScope.Private });

    input.userId = user.id;
    return this.activityRoutesService.cragSummary(input);
  }

  @Mutation(() => [ActivityRoute])
  @UseGuards(UserAuthGuard)
  async createActivityRoutes(
    @CurrentUser() user: User,
    @Args('routes', { type: () => [CreateActivityRouteInput] })
    routesIn: CreateActivityRouteInput[],
  ): Promise<ActivityRoute[]> {
    try {
      return this.activityRoutesService.createBatch(user, routesIn);
    } catch (exception) {
      throw exception;
    }
  }

  @Mutation(() => ActivityRoute)
  @UseInterceptors(AuditInterceptor)
  @UseGuards(UserAuthGuard)
  async updateActivityRoute(
    @CurrentUser() user: User,
    @Args('input', { type: () => UpdateActivityRouteInput })
    input: UpdateActivityRouteInput,
  ): Promise<ActivityRoute> {
    const activityRoute = await this.activityRoutesService.findOneById(
      input.id,
    );

    if (activityRoute.userId != user.id) {
      throw new ForbiddenException();
    }

    return this.activityRoutesService.update(input);
  }

  @Mutation(() => Boolean)
  @UseInterceptors(AuditInterceptor)
  @UseGuards(UserAuthGuard)
  async deleteActivityRoute(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<boolean> {
    const activityRoute = await this.activityRoutesService.findOneById(id);

    if (activityRoute.userId != user.id) {
      throw new ForbiddenException();
    }

    return this.activityRoutesService.delete(activityRoute);
  }

  @UseGuards(UserAuthGuard)
  @Query(returns => PaginatedActivityRoutes)
  activityRoutesByClubSlug(
    @CurrentUser() user: User,
    @Args('clubSlug') clubSlug: string,
    @Args('input', { nullable: true }) input: FindActivityRoutesInput = {},
    @Info() info: GraphQLResolveInfo,
  ): Promise<PaginatedActivityRoutes> {
    info.cacheControl.setCacheHint({ scope: CacheScope.Private });
    return this.activityRoutesService.finbByClubSlug(user, clubSlug, input);
  }

  @AllowAny()
  @UseGuards(UserAuthGuard)
  @Query(returns => [ActivityRoute])
  latestTicks(
    @CurrentUser() user: User,
    @Args('latestN', { type: () => Int, nullable: true }) latestN: number,
    @Args('inLastNDays', { type: () => Int, nullable: true })
    inLastNDays: number,
  ): Promise<ActivityRoute[]> {
    return this.activityRoutesService.latestTicks(
      user != null,
      latestN,
      inLastNDays,
    );
  }

  @ResolveField()
  score(@Parent() activityRoute: ActivityRoute): Promise<number> {
    return this.activityRoutesService.calculateScore(activityRoute);
  }
}
