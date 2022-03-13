import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { GradingSystem } from '../entities/grading-system.entity';
import { GradingSystemsService } from '../services/grading-systems.service';

@Injectable()
export class GradingSystemLoader
  implements NestDataLoader<string, GradingSystem> {
  constructor(private readonly gradingSystemsService: GradingSystemsService) {}

  generateDataLoader(): DataLoader<string, GradingSystem> {
    return new DataLoader<string, GradingSystem>(async keys => {
      const gradingSystems = await this.gradingSystemsService.find();

      const gradingSystemMap: { [key: string]: GradingSystem } = {};

      gradingSystems.forEach(gradingSystem => {
        gradingSystemMap[gradingSystem.id] = gradingSystem;
      });

      return keys.map(
        gradingSystemId => gradingSystemMap[gradingSystemId] ?? null,
      );
    });
  }
}
