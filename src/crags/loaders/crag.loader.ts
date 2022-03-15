import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { Crag } from '../entities/crag.entity';
import { CragsService } from '../services/crags.service';

@Injectable()
export class CragLoader implements NestDataLoader<string, Crag> {
  constructor(private readonly cragsService: CragsService) {}

  generateDataLoader(): DataLoader<string, Crag> {
    return new DataLoader<string, Crag>(async keys => {
      const crags = await this.cragsService.findByIds(keys.map(k => k));

      const cragsMap: { [key: string]: Crag } = {};

      crags.forEach(country => {
        cragsMap[country.id] = country;
      });

      return keys.map(cragId => cragsMap[cragId] ?? null);
    });
  }
}
