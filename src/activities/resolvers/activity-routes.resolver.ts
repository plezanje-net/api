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
import { MinCragStatus } from '../../crags/decorators/min-crag-status.decorator';
import { CragStatus } from '../../crags/entities/crag.entity';
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
import { RouteTouched } from '../utils/route-touched.class';
import { GraphQLResolveInfo } from 'graphql';
import { CacheScope } from 'apollo-server-types';
import { CreateActivityRouteInput } from '../dtos/create-activity-route.input';
import { ActivitiesService } from '../services/activities.service';

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
   * find out if currently logged in user has already tried and/or ticked a certain route
   */
  @UseGuards(UserAuthGuard)
  @Query(() => RouteTouched)
  routeTouched(
    @CurrentUser() user: User,
    @Args('routeId') routeId: string,
    @Info() info: GraphQLResolveInfo,
  ) {
    info.cacheControl.setCacheHint({ scope: CacheScope.Private });
    return this.activityRoutesService.routeTouched(user, routeId);
  }

  @UseGuards(UserAuthGuard)
  @Query(() => PaginatedActivityRoutes)
  myActivityRoutes(
    @CurrentUser() user: User,
    @Args('input', { nullable: true }) input: FindActivityRoutesInput = {},
    @Info() info: GraphQLResolveInfo,
  ): Promise<PaginatedActivityRoutes> {
    info.cacheControl.setCacheHint({ scope: CacheScope.Private });

    input.userId = user.id;
    return this.activityRoutesService.paginate(input);
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
    @MinCragStatus() minStatus: CragStatus,
    @Args('latestN', { type: () => Int, nullable: true }) latestN: number,
    @Args('inLastNDays', { type: () => Int, nullable: true })
    inLastNDays: number,
  ): Promise<ActivityRoute[]> {
    return this.activityRoutesService.latestTicks(
      minStatus,
      latestN,
      inLastNDays,
    );
  }
}
