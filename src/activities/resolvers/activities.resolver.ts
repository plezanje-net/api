import { UseGuards } from '@nestjs/common';
import { Resolver, Query } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { Activity } from '../entities/activity.entity';
import { ActivitiesService } from '../services/activities.service';

@Resolver(() => Activity)
export class ActivitiesResolver {

    constructor(
        private activitiesService: ActivitiesService
    ) { }

    @UseGuards(GqlAuthGuard)
    @Query(() => [Activity])
    myActivities(@CurrentUser() user: User): Promise<Activity[]> {
        return this.activitiesService.find({user: user});
    }
}
