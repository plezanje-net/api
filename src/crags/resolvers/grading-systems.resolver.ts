import { Args, Query, Resolver } from '@nestjs/graphql';
import { GradingSystem } from '../entities/grading-system.entity';
import { GradingSystemsService } from '../services/grading-systems.service';

@Resolver()
export class GradingSystemsResolver {
  constructor(private gradingSystemsService: GradingSystemsService) {}

  @Query(() => [GradingSystem])
  gradingSystems(): Promise<GradingSystem[]> {
    return this.gradingSystemsService.find();
  }
}
