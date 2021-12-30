import { UseFilters, UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
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

@Resolver(() => Activity)
export class ActivitiesResolver {
  constructor(private activitiesService: ActivitiesService) {}

  @UseGuards(UserAuthGuard)
  @Query(() => PaginatedActivities)
  myActivities(
    @CurrentUser() user: User,
    @Args('input', { nullable: true }) input: FindActivitiesInput = {},
  ): Promise<PaginatedActivities> {
    input.userId = user.id;

    return this.activitiesService.paginate(input);
  }

  @Query(() => Activity)
  @UseFilters(NotFoundFilter)
  async activity(@Args('id') id: string): Promise<Activity> {
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
      return this.activitiesService.createActivityWRoutes(
        activityIn,
        user,
        routesIn,
      );
    } catch (exception) {
      throw exception;
    }
  }
}
