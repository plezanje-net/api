import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { setBuilderCache } from '../../core/utils/entity-cache/entity-cache-helpers';
import { RouteType } from '../entities/route-type.entity';

@Injectable()
export class RouteTypesService {
  constructor(
    @InjectRepository(RouteType)
    private routeTypeRepository: Repository<RouteType>,
  ) {}

  async find(): Promise<RouteType[]> {
    const builder = this.routeTypeRepository
      .createQueryBuilder('routeType')
      .orderBy({ 'routeType.position': 'ASC' });
    setBuilderCache(builder);
    return builder.getMany();
  }
}
