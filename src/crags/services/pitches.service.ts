import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pitch } from '../entities/pitch.entity';

@Injectable()
export class PitchesService {

  constructor(
    @InjectRepository(Pitch)
    private pitchRepository: Repository<Pitch>,
  ) {}

  async findByRouteId(routeId: string): Promise<Pitch[]> {
    const pitches = this.pitchRepository.find({
      where: { route: routeId },
      order: { number: 'ASC' },
    });

    return await pitches;
  }
}
