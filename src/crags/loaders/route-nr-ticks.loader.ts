import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { RoutesService } from '../services/routes.service';

@Injectable()
export class RouteNrTicksLoader implements NestDataLoader<string, number> {
  constructor(private readonly routesService: RoutesService) {}

  generateDataLoader(): DataLoader<string, number> {
    return new DataLoader<string, number>(async keys => {
      const tickCounts = await this.routesService.countManyTicks(keys);

      const tickCountsMap = {};

      tickCounts.forEach(
        tickCount => (tickCountsMap[tickCount.r_id] = tickCount.nrTicks),
      );

      return keys.map(routeId => tickCountsMap[routeId]);
    });
  }
}
