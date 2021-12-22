import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DifficultyVote } from '../entities/difficulty-vote.entity';

@Injectable()
export class DifficultyVotesService {
  constructor(
    @InjectRepository(DifficultyVote)
    private difficultyVoteRepository: Repository<DifficultyVote>,
  ) {}

  async findByRouteId(routeId: string): Promise<DifficultyVote[]> {
    const grades = this.difficultyVoteRepository.find({
      where: { route: routeId },
      order: { difficulty: 'ASC' },
    });

    const gradesLength = (await grades).length;

    if (gradesLength == 1) {
      (await grades)[0].includedInCalculation = true;
    } else if (gradesLength === 2) {
      (await grades).forEach((grade: DifficultyVote) => {
        grade.includedInCalculation = grade.isBase;
      });
    } else if (gradesLength > 2) {
      const roundedFifth = Math.round(gradesLength * 0.2);

      (await grades).forEach((grade: DifficultyVote, i: number) => {
        grade.includedInCalculation =
          i >= roundedFifth && i < gradesLength - roundedFifth;
      });
    }

    return grades;
  }
}
