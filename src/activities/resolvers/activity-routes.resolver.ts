import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { User } from '../../users/entities/user.entity';
import { FindActivityRoutesInput } from '../dtos/find-activity-routes.input';
import { ActivityRoute } from '../entities/activity-route.entity';
import { ActivityRoutesService } from '../services/activity-routes.service';
import { PaginatedActivityRoutes } from '../utils/paginated-activity-routes.class';
import { RouteTouched } from '../utils/route-touched.class';

@Resolver()
export class ActivityRoutesResolver {
  constructor(private activityRoutesService: ActivityRoutesService) {}

  @UseGuards(UserAuthGuard)
  @Query(() => PaginatedActivityRoutes)
  myActivityRoutes(
    @CurrentUser() user: User,
    @Args('input', { nullable: true }) input: FindActivityRoutesInput = {},
  ): Promise<PaginatedActivityRoutes> {
    input.userId = user.id;
    return this.activityRoutesService.paginate(input);
  }

  /**
   * find out if currently logged in user has already tried and/or ticked a certain route
   */
  @UseGuards(UserAuthGuard)
  @Query(() => RouteTouched)
  routeTouched(@CurrentUser() user: User, @Args('routeId') routeId: string) {
    return this.activityRoutesService.routeTouched(user, routeId);
  }

  @UseGuards(UserAuthGuard)
  @Query(() => [ActivityRoute])
  myCragSummary(
    @CurrentUser() user: User,
    @Args('input', { nullable: true }) input: FindActivityRoutesInput = {},
  ): Promise<ActivityRoute[]> {
    input.userId = user.id;
    return this.activityRoutesService.cragSummary(input);
  }

  // TODO: add clubId to input?
  @UseGuards(UserAuthGuard)
  @Query(returns => PaginatedActivityRoutes)
  activityRoutesByClubSlug(
    @CurrentUser() user: User,
    @Args('clubSlug') clubSlug: string,
    @Args('input', { nullable: true }) input: FindActivityRoutesInput = {},
  ): Promise<PaginatedActivityRoutes> {
    return this.activityRoutesService.finbByClubSlug(user, clubSlug, input);
  }

  @Query(returns => [ActivityRoute])
  latestTicks(
    @Args('latest', { type: () => Int }) latest: number,
  ): Promise<ActivityRoute[]> {
    return this.activityRoutesService.latestTicks(latest);
  }
}
