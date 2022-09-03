import DataLoader from 'dataloader';
import { Inject, Injectable } from '@nestjs/common';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { RoutesService } from '../services/routes.service';
import { User } from '../../users/entities/user.entity';
import { CONTEXT } from '@nestjs/graphql';
import { Route } from '../entities/route.entity';

@Injectable()
export class SectorRoutesLoader implements NestDataLoader<string, Route[]> {
  currentUser: User = null;

  constructor(
    private readonly routesService: RoutesService,
    @Inject(CONTEXT) private context: any,
  ) {
    this.currentUser = this.context.req.user;
  }

  generateDataLoader(): DataLoader<string, Route[]> {
    return new DataLoader<string, Route[]>(async keys => {
      const routes = await this.routesService.find({
        sectorIds: keys.map(k => k),
        user: this.currentUser,
      });

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
