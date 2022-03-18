import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { Activity } from '../entities/activity.entity';
import { ActivitiesService } from '../services/activities.service';

@Injectable()
export class ActivityLoader implements NestDataLoader<string, Activity> {
  constructor(private readonly activitiesService: ActivitiesService) {}

  generateDataLoader(): DataLoader<string, Activity> {
    return new DataLoader<string, Activity>(async keys => {
      const activities = await this.activitiesService.findByIds(
        keys.map(k => k),
      );

      const activitiesMap: { [key: string]: Activity } = {};

      activities.forEach(activity => {
        activitiesMap[activity.id] = activity;
      });

      return keys.map(activityId => activitiesMap[activityId] ?? null);
    });
  }
}
