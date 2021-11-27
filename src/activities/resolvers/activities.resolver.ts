import { UseFilters, UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Activity } from '../entities/activity.entity';
import { PaginatedActivities } from '../utils/paginated-activities.class';
import { ActivitiesService } from '../services/activities.service';
import { FindActivitiesInput } from '../dtos/find-activities.input';
import { CreateActivityInput } from '../dtos/create-activity.input';
import { CreateActivityRouteInput } from '../dtos/create-activity-route.input';
import { ActivityRoutesService } from '../services/activity-routes.service';
import { NotFoundFilter } from 'src/crags/filters/not-found.filter';
import { UserAuthGuard } from 'src/auth/guards/user-auth.guard';

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
    input: CreateActivityInput,
    @Args('routes', { type: () => [CreateActivityRouteInput] })
    routes: CreateActivityRouteInput[],
  ): Promise<Activity> {
    const activity = await this.activitiesService.create(input, user);

    routes.forEach(async route => {
      await this.activityRoutesService.create(route, user, activity);
    });

    return this.activitiesService.findOneById(activity.id);
  }
}
