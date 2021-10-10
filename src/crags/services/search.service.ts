import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  QueryBuilder,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { FindCragsInput } from '../dtos/find-crags.input';
import { Crag } from '../entities/crag.entity';
import { Route } from '../entities/route.entity';
import { SearchResult } from '../utils/search-result.class';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    @InjectRepository(Crag)
    private cragsRepository: Repository<Crag>,
  ) {}

  async find(
    query: string,
    cragParams: FindCragsInput,
  ): Promise<SearchResult[]> {
    return Promise.resolve([
      ...(await this.findCrags(query, cragParams)).map(crag => ({
        name: crag.name,
        type: 'crag',
        crag: crag,
      })),
      ...(await this.findRoutes(query, cragParams)).map(route => ({
        name: route.name,
        type: 'route',
        route: route,
      })),
    ]);

    return Promise.resolve([]);
  }

  findCrags(query: string, cragParams: FindCragsInput): Promise<Crag[]> {
    const builder = this.cragsRepository.createQueryBuilder('c');

    builder.where('c."peakId" IS NULL');

    if (cragParams.minStatus != null) {
      builder.andWhere('c.status >= :minStatus', {
        minStatus: cragParams.minStatus,
      });
    }

    this.tokenizeQueryToBuilder(builder, query, 'c');

    return builder.getMany();
  }

  findRoutes(query: string, cragParams: FindCragsInput): Promise<Route[]> {
    const builder = this.routesRepository.createQueryBuilder('r');

    builder.innerJoin('crag', 'c', 'c.id = r."cragId"');

    builder.where('c."peakId" IS NULL');

    if (cragParams.minStatus != null) {
      builder.andWhere('c.status >= :minStatus', {
        minStatus: cragParams.minStatus,
      });
    }

    this.tokenizeQueryToBuilder(builder, query, 'r');

    return builder.getMany();
  }

  tokenizeQueryToBuilder(
    builder: SelectQueryBuilder<Crag | Route>,
    query: string,
    alias: string,
  ): void {
    const queryParts = query.split(' ');

    queryParts.forEach((word, index) => {
      builder.andWhere(
        new Brackets(qb => {
          qb.where(
            `unaccent(lower(${alias}.name)) like unaccent(lower(:search_start_${index}))`,
            {
              [`search_start_${index}`]: `${word}%`,
            },
          ).orWhere(
            `unaccent(lower(${alias}.name)) like lower((:search_mid_${index}))`,
            {
              [`search_mid_${index}`]: `% ${word}%`,
            },
          );
        }),
      );
    });
  }
}
