import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Parking } from '../entities/parking.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ParkingsService {
  constructor(
    @InjectRepository(Parking) private parkingsRepository: Repository<Parking>,
  ) {}

  async getParkings(sectorId: string): Promise<Parking[]> {
    const qb = this.parkingsRepository
      .createQueryBuilder('parking')
      .leftJoin('parking.sectors', 'sector')
      .where('sector.id = :sectorId', { sectorId });

    return qb.getMany();
  }
}
