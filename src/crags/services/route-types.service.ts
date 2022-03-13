import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteType } from '../entities/route-type.entity';

@Injectable()
export class RouteTypesService {
  constructor(
    @InjectRepository(RouteType)
    private routeTypeRepository: Repository<RouteType>,
  ) {}

  async find(): Promise<RouteType[]> {
    return this.routeTypeRepository
      .createQueryBuilder('routeType')
      .orderBy({ 'routeType.position': 'ASC' })
      .getMany();
  }
}
