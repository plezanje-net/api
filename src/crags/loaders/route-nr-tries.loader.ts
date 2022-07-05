import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { RoutesService } from '../services/routes.service';

@Injectable()
export class RouteNrTriesLoader implements NestDataLoader<string, number> {
  constructor(private readonly routesService: RoutesService) {}

  generateDataLoader(): DataLoader<string, number> {
    return new DataLoader<string, number>(async keys => {
      const tryCounts = await this.routesService.countManyTries(keys);

      const tryCountsMap = {};

      tryCounts.forEach(
        tryCount => (tryCountsMap[tryCount.r_id] = tryCount.nrTries),
      );

      return keys.map(routeId => tryCountsMap[routeId]);
    });
  }
}
