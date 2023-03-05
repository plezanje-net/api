import {
  ForbiddenException,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Parent,
  Info,
} from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Activity } from '../entities/activity.entity';
import { PaginatedActivities } from '../utils/paginated-activities.class';
import { ActivitiesService } from '../services/activities.service';
import { FindActivitiesInput } from '../dtos/find-activities.input';
import { CreateActivityInput } from '../dtos/create-activity.input';
import { CreateActivityRouteInput } from '../dtos/create-activity-route.input';
import { ActivityRoutesService } from '../services/activity-routes.service';
import { NotFoundFilter } from '../../crags/filters/not-found.filter';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { ActivityRoute } from '../entities/activity-route.entity';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { GraphQLResolveInfo } from 'graphql';
import { CacheScope } from 'apollo-server-types';
import { SideEffect } from '../utils/side-effect.class';
import { UpdateActivityInput } from '../dtos/update-activity.input';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { FindActivityRoutesInput } from '../dtos/find-activity-routes.input';
import {
  DataLoaderInterceptor,
  Loader,
} from '../../core/interceptors/data-loader.interceptor';
import { UserLoader } from '../../users/loaders/user.loader';
import DataLoader from 'dataloader';

@Resolver(() => Activity)
@UseInterceptors(DataLoaderInterceptor)
export class ActivitiesResolver {
  constructor(
    private activitiesService: ActivitiesService,
    private activityRoutesService: ActivityRoutesService,
  ) {}

  @UseGuards(UserAuthGuard)
  @Query(() => PaginatedActivities)
  myActivities(
    @CurrentUser() currentUser: User,
    @Args('input', { nullable: true }) input: FindActivitiesInput = {},
    @Info() info: GraphQLResolveInfo,
  ): Promise<PaginatedActivities> {
    info.cacheControl.setCacheHint({ scope: CacheScope.Private });
    input.userId = currentUser.id;

    return this.activitiesService.paginate(input, currentUser);
  }

  @UseGuards(UserAuthGuard)
  @Query(() => Activity)
  @UseFilters(NotFoundFilter)
  async activity(
    @CurrentUser() currentUser: User,
    @Args('id') id: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Activity> {
    info.cacheControl.setCacheHint({ scope: CacheScope.Private });
    return this.activitiesService.findOneById(id, currentUser);
  }

  @AllowAny()
  @UseGuards(UserAuthGuard)
  @Query(() => PaginatedActivities)
  async activities(
    @CurrentUser() currentUser: User,
    @Args('input', { nullable: true }) input: FindActivitiesInput = {},
  ): Promise<PaginatedActivities> {
    // Should allow to return:
    // based on logged in user:
    //  - all activities with at least one public activity route and
    //  - all activities belonging to current user (if user is logged in) and
    //  - all activities with at least one activity route with publish 'club' and belonging to any user in the same club as the current user.
    // TODO: clubs
    //
    // based on crag visibility:
    //  - all activities in public crags if the user is not logged in
    //  - all activities if a user is logged in
    //
    // based on publish status of the crag:
    //  - all activities in draft crags if the logged in user is the author of the crag and all activities in published crags
    //  - all activities in in_review crags if the logged in user is the author of the crag or has a role of editor and all activities in published crags
    //  - only activities in published crags if the user is not logged in
    //
    // based on publish status of routes of contained activity routes
    // - similar to above, but only activities with at least one 'allowed' route

    // Should return:
    //  - a subset of the above, based on the input params.

    return this.activitiesService.paginate(input, currentUser);
  }

  @Mutation(() => Activity)
  @UseGuards(UserAuthGuard)
  async createActivity(
    @CurrentUser() user: User,
    @Args('input', { type: () => CreateActivityInput })
    activityIn: CreateActivityInput,
    @Args('routes', { type: () => [CreateActivityRouteInput] })
    routesIn: CreateActivityRouteInput[],
  ): Promise<Activity> {
    try {
      return this.activitiesService.createActivityWRoutes(
        activityIn,
        user,
        routesIn,
      );
    } catch (exception) {
      throw exception;
    }
  }

  /**
   * Because creating activity with routes can produce side effects, this query will simulate it, and return what will be changed if the mutation was actually ran
   */
  @Query(() => [SideEffect])
  @UseGuards(UserAuthGuard)
  async dryRunCreateActivity(
    @CurrentUser() user: User,
    @Args('input', { type: () => CreateActivityInput })
    activityIn: CreateActivityInput,
    @Args('routes', { type: () => [CreateActivityRouteInput] })
    routesIn: CreateActivityRouteInput[],
  ): Promise<SideEffect[]> {
    try {
      const sideEffects = [];
      await this.activitiesService.createActivityWRoutes(
        activityIn,
        user,
        routesIn,
        true,
        sideEffects,
      );
      return sideEffects;
    } catch (exception) {
      throw exception;
    }
  }

  @Query(() => [SideEffect])
  @UseGuards(UserAuthGuard)
  async dryRunUpdateActivity(
    @CurrentUser() currentUser: User,
    @Args('input', { type: () => UpdateActivityInput })
    activityIn: UpdateActivityInput,
    @Args('routes', { type: () => [CreateActivityRouteInput] })
    routesIn: CreateActivityRouteInput[],
  ): Promise<SideEffect[]> {
    const activity = await this.activitiesService.findOneById(
      activityIn.id,
      currentUser,
    );

    if (activity.userId != currentUser.id) {
      throw new ForbiddenException();
    }

    try {
      const sideEffects = [];
      await this.activitiesService.updateActivityWithRoutes(
        activityIn,
        currentUser,
        routesIn,
        true,
        sideEffects,
      );
      return sideEffects;
    } catch (exception) {
      throw exception;
    }
  }

  @Mutation(() => Activity)
  @UseGuards(UserAuthGuard)
  async updateActivity(
    @CurrentUser() currentUser: User,
    @Args('input', { type: () => UpdateActivityInput })
    activityIn: UpdateActivityInput,
    @Args('routes', { type: () => [CreateActivityRouteInput] })
    routesIn: CreateActivityRouteInput[],
  ): Promise<Activity> {
    const activity = await this.activitiesService.findOneById(
      activityIn.id,
      currentUser,
    );

    if (activity.userId != currentUser.id) {
      throw new ForbiddenException();
    }

    try {
      return this.activitiesService.updateActivityWithRoutes(
        activityIn,
        currentUser,
        routesIn,
      );
    } catch (exception) {
      throw exception;
    }
  }

  @Mutation(() => Boolean)
  @UseInterceptors(AuditInterceptor)
  @UseGuards(UserAuthGuard)
  async deleteActivity(
    @CurrentUser() currentUser: User,
    @Args('id') id: string,
  ): Promise<boolean> {
    const activity = await this.activitiesService.findOneById(id, currentUser);

    if (activity.userId != currentUser.id) {
      throw new ForbiddenException();
    }

    return this.activitiesService.delete(activity);
  }

  @ResolveField('routes', () => [ActivityRoute])
  async getRoutes(
    @Parent() activity: Activity,
    @CurrentUser() currentUser: User,
    @Args('input', { nullable: true }) input: FindActivityRoutesInput = {},
  ): Promise<ActivityRoute[]> {
    // Should allow to return child activity routes that are:
    //  - publicly published or
    //  - belonging to the current user (if user is logged in) or
    //  - have publish 'club' and belong to any user in the same club as the current user
    // TODO: clubs
    //  - have any of the 'allowed' publishStatuses based on currentUser and 'ownership'

    input.activityId = activity.id;
    if (!input.orderBy) {
      input.orderBy = { field: 'position', direction: 'ASC' };
    }
    return this.activityRoutesService.find(input, currentUser);
  }

  @ResolveField('user', () => User)
  async getUser(
    @Parent() activity: Activity,
    @Loader(UserLoader)
    loader: DataLoader<Activity['userId'], User>,
  ): Promise<User> {
    return loader.load(activity.userId);
  }
}
