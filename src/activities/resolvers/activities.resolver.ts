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

@Resolver(() => Activity)
export class ActivitiesResolver {
  constructor(
    private activitiesService: ActivitiesService,
    private activityRoutesService: ActivityRoutesService,
  ) {}

  @UseGuards(UserAuthGuard)
  @Query(() => PaginatedActivities)
  myActivities(
    @CurrentUser() user: User,
    @Args('input', { nullable: true }) input: FindActivitiesInput = {},
    @Info() info: GraphQLResolveInfo,
  ): Promise<PaginatedActivities> {
    info.cacheControl.setCacheHint({ scope: CacheScope.Private });
    input.userId = user.id;

    return this.activitiesService.paginate(input);
  }

  @Query(() => Activity)
  @UseFilters(NotFoundFilter)
  async activity(
    @Args('id') id: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Activity> {
    info.cacheControl.setCacheHint({ scope: CacheScope.Private });
    return this.activitiesService.findOneById(id);
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
      return <Activity>(
        (<unknown>(
          this.activitiesService.createActivityWRoutes(
            activityIn,
            user,
            routesIn,
          )
        ))
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
      return <SideEffect[]>(
        (<unknown>(
          this.activitiesService.createActivityWRoutes(
            activityIn,
            user,
            routesIn,
            true,
          )
        ))
      );
    } catch (exception) {
      throw exception;
    }
  }

  @Mutation(() => Boolean)
  @UseInterceptors(AuditInterceptor)
  @UseGuards(UserAuthGuard)
  async deleteActivity(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<boolean> {
    const activity = await this.activitiesService.findOneById(id);

    if (activity.userId != user.id) {
      throw new ForbiddenException();
    }

    return this.activitiesService.delete(activity);
  }

  @ResolveField('routes', () => [ActivityRoute])
  async getRoutes(@Parent() activity: Activity): Promise<ActivityRoute[]> {
    return this.activityRoutesService.find({
      activityId: activity.id,
    });
  }
}
