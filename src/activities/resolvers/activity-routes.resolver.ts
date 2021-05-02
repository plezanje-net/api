import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { FindActivityRoutesInput } from '../dtos/find-activity-routes.input';
import { ActivityRoutesService } from '../services/activity-routes.service';
import { PaginatedActivityRoutes } from '../utils/paginated-activity-routes.class';

@Resolver()
export class ActivityRoutesResolver {
    constructor(
        private activityRoutesService: ActivityRoutesService
    ) { }

    @UseGuards(GqlAuthGuard)
    @Query(() => PaginatedActivityRoutes)
    myActivityRoutes(@CurrentUser() user: User, @Args('input', { nullable: true }) input: FindActivityRoutesInput = {}): Promise<PaginatedActivityRoutes> {
        input.userId = user.id;

        return this.activityRoutesService.paginate(input);
    }
}
