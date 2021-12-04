import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pitch } from '../entities/pitch.entity';

@Injectable()
export class PitchesService {
  constructor(
    @InjectRepository(Pitch)
    private pitchRepository: Repository<Pitch>,
  ) {}

  async findByRouteIds(routeIds: string[]): Promise<Pitch[]> {
    const pitches = this.pitchRepository.find({
      where: { routeId: In(routeIds) },
      order: { number: 'ASC' },
    });

    return await pitches;
  }
}
