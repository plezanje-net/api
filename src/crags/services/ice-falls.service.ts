import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IceFall } from '../entities/ice-fall.entity';

@Injectable()
export class IceFallsService {
  constructor(
    @InjectRepository(IceFall)
    private iceFallsRepository: Repository<IceFall>,
  ) {}

  async findOneBySlug(slug: string): Promise<IceFall> {
    return this.iceFallsRepository.findOneOrFail({ slug: slug });
  }
}
