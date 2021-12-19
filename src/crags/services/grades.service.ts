import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../entities/grade.entity';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
  ) {}
}
