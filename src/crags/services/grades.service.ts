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

  async findByRouteId(routeId: string): Promise<Grade[]> {
    let grades = this.gradeRepository.find({
      where: { route: routeId },
      order: { grade: 'ASC' },
    });

    const gradesLength = (await grades).length;
    let roundedFifth: number;

    if (gradesLength == 1) {
      (await grades)[0].includedInCalculation = true;
    } else if (gradesLength === 2) {
      (await grades).forEach((grade: Grade) => {
        grade.includedInCalculation = grade.isBase;
      });
    } else if (gradesLength > 2) {
      const roundedFifth = Math.round(gradesLength * 0.2);

      (await grades).forEach((grade: Grade, i: number) => {
        grade.includedInCalculation =
          i >= roundedFifth && i < gradesLength - roundedFifth;
      });
    }

    return grades;
  }
}
