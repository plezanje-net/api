import DataLoader from 'dataloader';
import { Inject, Injectable } from '@nestjs/common';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { Activity } from '../entities/activity.entity';
import { ActivitiesService } from '../services/activities.service';
import { CONTEXT } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ActivityLoader implements NestDataLoader<string, Activity> {
  currentUser: User = null;

  constructor(
    private readonly activitiesService: ActivitiesService,
    @Inject(CONTEXT) private context: any,
  ) {
    this.currentUser = this.context.req.user;
  }

  generateDataLoader(): DataLoader<string, Activity> {
    return new DataLoader<string, Activity>(async keys => {
      const activities = await this.activitiesService.findByIds(
        keys.map(k => k),
        this.currentUser,
      );

      const activitiesMap: { [key: string]: Activity } = {};

      activities.forEach(activity => {
        activitiesMap[activity.id] = activity;
      });

      return keys.map(activityId => activitiesMap[activityId] ?? null);
    });
  }
}
