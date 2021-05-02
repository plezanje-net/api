import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { Activity } from '../entities/activity.entity';
import { PaginatedActivities } from '../utils/paginated-activities.class';
import { ActivitiesService } from '../services/activities.service';
import { FindActivitiesInput } from '../dtos/find-activities.input';

@Resolver(() => Activity)
export class ActivitiesResolver {

    constructor(
        private activitiesService: ActivitiesService
    ) { }

    @UseGuards(GqlAuthGuard)
    @Query(() => PaginatedActivities)
    myActivities(@CurrentUser() user: User, @Args('input', { nullable: true }) input: FindActivitiesInput = {}): Promise<PaginatedActivities> {
        input.userId = user.id;

        return this.activitiesService.paginate(input);
    }
}
