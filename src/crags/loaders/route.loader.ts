import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { RoutesService } from '../../crags/services/routes.service';
import { Route } from '../../crags/entities/route.entity';

@Injectable()
export class RouteLoader implements NestDataLoader<string, Route> {
  constructor(private readonly routesService: RoutesService) {}

  generateDataLoader(): DataLoader<string, Route> {
    return new DataLoader<string, Route>(async keys => {
      const routes = await this.routesService.findByIds(keys.map(k => k));

      const routesMap: { [key: string]: Route } = {};

      routes.forEach(route => {
        routesMap[route.id] = route;
      });

      return keys.map(routeId => routesMap[routeId] ?? null);
    });
  }
}
