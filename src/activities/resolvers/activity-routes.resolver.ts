import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { FindActivityRoutesInput } from '../dtos/find-activity-routes.input';
import { ActivityRoute } from '../entities/activity-route.entity';
import { ActivityRoutesService } from '../services/activity-routes.service';
import { PaginatedActivityRoutes } from '../utils/paginated-activity-routes.class';

@Resolver()
export class ActivityRoutesResolver {
  constructor(private activityRoutesService: ActivityRoutesService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => PaginatedActivityRoutes)
  myActivityRoutes(
    @CurrentUser() user: User,
    @Args('input', { nullable: true }) input: FindActivityRoutesInput = {},
  ): Promise<PaginatedActivityRoutes> {
    input.userId = user.id;
    return this.activityRoutesService.paginate(input);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [ActivityRoute])
  myCragSummary(
    @CurrentUser() user: User,
    @Args('input', { nullable: true }) input: FindActivityRoutesInput = {},
  ): Promise<ActivityRoute[]> {
    input.userId = user.id;
    return this.activityRoutesService.cragSummary(input);
  }

  // TODO: add clubId to input?
  @UseGuards(GqlAuthGuard)
  @Query(returns => PaginatedActivityRoutes)
  activityRoutesByClub(
    @CurrentUser() user: User,
    @Args('clubId') clubId: string,
    @Args('input', { nullable: true }) input: FindActivityRoutesInput = {},
  ): Promise<PaginatedActivityRoutes> {
    return this.activityRoutesService.finbByClub(user, clubId, input);
  }

  @Query(returns => [ActivityRoute])
  latestTicks(
    @Args('latest', { type: () => Int }) latest: number,
  ): Promise<ActivityRoute[]> {
    return this.activityRoutesService.latestTicks(latest);
  }
}
