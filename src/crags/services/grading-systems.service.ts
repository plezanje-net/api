import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradingSystem } from '../entities/grading-system.entity';

@Injectable()
export class GradingSystemsService {
  constructor(
    @InjectRepository(GradingSystem)
    private gradingSystemRepository: Repository<GradingSystem>,
  ) {}

  async find(): Promise<GradingSystem[]> {
    return this.gradingSystemRepository.find({
      order: { position: 'ASC' },
    });
  }
}
