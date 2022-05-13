import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { RoutesService } from '../services/routes.service';

@Injectable()
export class RouteNrClimbersLoader implements NestDataLoader<string, number> {
  constructor(private readonly routesService: RoutesService) {}

  generateDataLoader(): DataLoader<string, number> {
    return new DataLoader<string, number>(async keys => {
      const climbersCounts = await this.routesService.countManyDisctinctClimbers(
        keys,
      );

      const climbersCountsMap = {};

      climbersCounts.forEach(
        climbersCount =>
          (climbersCountsMap[climbersCount.r_id] = climbersCount.nrClimbers),
      );

      return keys.map(routeId => climbersCountsMap[routeId]);
    });
  }
}
