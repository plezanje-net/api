import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { Route } from '../entities/route.entity';
import { RoutesService } from '../services/routes.service';

@Injectable()
export class SectorRoutesLoader implements NestDataLoader<string, Route[]> {
  constructor(private readonly routesService: RoutesService) {}

  generateDataLoader(): DataLoader<string, Route[]> {
    return new DataLoader<string, Route[]>(async keys => {
      const routes = await this.routesService.findBySectorIds(keys.map(k => k));

      const sectorRoutes: { [key: string]: Route[] } = {};

      routes.forEach(route => {
        if (!sectorRoutes[route.sectorId]) {
          sectorRoutes[route.sectorId] = [route];
        } else {
          sectorRoutes[route.sectorId].push(route);
        }
      });

      return keys.map(sectorId => sectorRoutes[sectorId] ?? []);
    });
  }
}
