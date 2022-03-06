import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { RouteTypesService } from '../services/route-types.service';
import { RouteType } from '../entities/route-type.entity';

@Injectable()
export class RouteTypeLoader implements NestDataLoader<string, RouteType> {
  constructor(private readonly routeTypesService: RouteTypesService) {}

  generateDataLoader(): DataLoader<string, RouteType> {
    return new DataLoader<string, RouteType>(async keys => {
      const routeTypes = await this.routeTypesService.find();

      const routeTypeMap: { [key: string]: RouteType } = {};

      routeTypes.forEach(routeType => {
        routeTypeMap[routeType.id] = routeType;
      });

      return keys.map(routeTypeId => routeTypeMap[routeTypeId] ?? null);
    });
  }
}
