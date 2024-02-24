import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { Area } from '../entities/area.entity';
import { AreasService } from '../services/areas.service';

@Injectable()
export class AreaLoader implements NestDataLoader<string, Area> {
  constructor(private readonly areasService: AreasService) {}

  generateDataLoader(): DataLoader<string, Area> {
    return new DataLoader<string, Area>(async (keys) => {
      const areas = await this.areasService.findByIds(keys.map((k) => k));

      const areasMap: { [key: string]: Area } = {};

      areas.forEach((area) => {
        areasMap[area.id] = area;
      });

      return keys.map((areaId) => areasMap[areaId] ?? null);
    });
  }
}
