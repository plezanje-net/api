import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { CragProperty } from '../entities/crag-property.entity';
import { Crag } from '../entities/crag.entity';
import { IceFallProperty } from '../entities/ice-fall-property.entity';
import { IceFall } from '../entities/ice-fall.entity';
import { RouteProperty } from '../entities/route-property.entity';
import { Route } from '../entities/route.entity';

@Injectable()
export class EntityPropertiesService {
  constructor(
    @InjectRepository(RouteProperty)
    private routePropertyRepository: Repository<RouteProperty>,
    @InjectRepository(CragProperty)
    private cragPropertyRepository: Repository<CragProperty>,
    @InjectRepository(IceFallProperty)
    private iceFallPropertyRepository: Repository<IceFallProperty>,
  ) {}

  getRouteProperties(route: Route): Promise<RouteProperty[]> {
    return <Promise<RouteProperty[]>>this.getEntityProperties(
      this.routePropertyRepository,
      {
        routeId: route.id,
      },
    );
  }

  getCragProperties(crag: Crag): Promise<CragProperty[]> {
    return <Promise<CragProperty[]>>this.getEntityProperties(
      this.cragPropertyRepository,
      {
        cragId: crag.id,
      },
    );
  }

  getIceFallProperties(iceFall: IceFall): Promise<IceFallProperty[]> {
    return <Promise<IceFallProperty[]>>this.getEntityProperties(
      this.iceFallPropertyRepository,
      {
        iceFallId: iceFall.id,
      },
    );
  }

  getEntityProperties(
    repository: Repository<RouteProperty | CragProperty | IceFallProperty>,
    condition: ObjectLiteral,
  ): Promise<(RouteProperty | CragProperty | IceFallProperty)[]> {
    const qb = repository.createQueryBuilder('property');
    qb.innerJoin('property.property_type', 'pt');
    qb.where(condition);
    qb.orderBy('pt.position');
    return qb.getMany();
  }
}
