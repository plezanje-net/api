import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from 'src/core/interceptors/data-loader.interceptor';
import { Pitch } from '../entities/pitch.entity';
import { PitchesService } from '../services/pitches.service';

@Injectable()
export class RoutePitchesLoader implements NestDataLoader<string, Pitch[]> {
  constructor(private readonly pitchesService: PitchesService) {}

  generateDataLoader(): DataLoader<string, Pitch[]> {
    return new DataLoader<string, Pitch[]>(async keys => {
      const pitches = await this.pitchesService.findByRouteIds(
        keys.map(k => k),
      );

      const routePitches: { [key: string]: Pitch[] } = {};

      pitches.forEach(pitch => {
        if (!routePitches[pitch.routeId]) {
          routePitches[pitch.routeId] = [pitch];
        } else {
          routePitches[pitch.routeId].push(pitch);
        }
      });

      return keys.map(routeId => routePitches[routeId] ?? []);
    });
  }
}
