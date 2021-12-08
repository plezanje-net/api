import { Injectable } from '@nestjs/common';
import { CreateCragInput } from '../dtos/create-crag.input';
import { Crag } from '../entities/crag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UpdateCragInput } from '../dtos/update-crag.input';
import { Country } from '../../crags/entities/country.entity';
import { Route } from '../entities/route.entity';
import { Area } from '../entities/area.entity';
import { FindCragsInput } from '../dtos/find-crags.input';
import { PopularCrag } from '../utils/popular-crag.class';
import { filter, from, lastValueFrom, map, of, pipe, pluck } from 'rxjs';

@Injectable()
export class CragsService {
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    @InjectRepository(Crag)
    private cragsRepository: Repository<Crag>,
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
    @InjectRepository(Area)
    private areasRepository: Repository<Area>,
  ) {}

  async findOneById(id: string): Promise<Crag> {
    return this.cragsRepository.findOneOrFail(id);
  }

  async findOneBySlug(slug: string): Promise<Crag> {
    return this.cragsRepository.findOneOrFail({ slug: slug });
  }

  async find(params: FindCragsInput = {}): Promise<Crag[]> {
    const rawAndEntities = await this.buildQuery(params).getRawAndEntities();

    const crags = rawAndEntities.entities.map((element, index) => {
      element.routeCount = rawAndEntities.raw[index].routeCount;
      return element;
    });

    return crags;
  }

  async create(data: CreateCragInput): Promise<Crag> {
    const crag = new Crag();

    this.cragsRepository.merge(crag, data);

    crag.country = Promise.resolve(
      await this.countryRepository.findOneOrFail(data.countryId),
    );

    if (data.areaId != null) {
      crag.area = Promise.resolve(
        await this.areasRepository.findOneOrFail(data.areaId),
      );
    }

    return this.cragsRepository.save(crag);
  }

  async update(data: UpdateCragInput): Promise<Crag> {
    const crag = await this.cragsRepository.findOneOrFail(data.id);

    this.cragsRepository.merge(crag, data);

    if (data.areaId != null) {
      crag.area = Promise.resolve(
        await this.areasRepository.findOneOrFail(data.areaId),
      );
    }

    if (data.areaId == null) {
      crag.area = null;
    }

    return this.cragsRepository.save(crag);
  }

  async delete(id: string): Promise<boolean> {
    const crag = await this.cragsRepository.findOneOrFail(id);

    return this.cragsRepository.remove(crag).then(() => true);
  }

  private buildQuery(params: FindCragsInput = {}): SelectQueryBuilder<Crag> {
    const builder = this.cragsRepository.createQueryBuilder('c');

    builder.orderBy('c.name', 'ASC');

    if (params.country != null) {
      builder.andWhere('c.country = :countryId', {
        countryId: params.country,
      });
    }

    if (params.area != null) {
      builder.andWhere('c.area = :areaId', {
        areaId: params.area,
      });
    }

    if (params.minStatus != null) {
      builder.andWhere('c.status <= :minStatus', {
        minStatus: params.minStatus,
      });
    }

    if (params.routeType != null) {
      builder
        .innerJoin('c.routes', 'route')
        .andWhere('(route.type = :routeType)', { routeType: params.routeType })
        .groupBy('c.id');

      builder.addSelect('COUNT(route.id)', 'routeCount');
    }

    if (!params.allowEmpty) {
      builder.andWhere('"nrRoutes" > 0');
    }

    return builder;
  }

  async getNumberOfRoutes(crag: Crag): Promise<number> {
    return this.routesRepository
      .createQueryBuilder('route')
      .innerJoinAndSelect('route.sector', 'sector')
      .where('sector.crag_id = :cragId', { cragId: crag.id })
      .getCount();
  }

  async getMinGrade(crag: Crag): Promise<number> {
    return this.routesRepository
      .createQueryBuilder('route')
      .innerJoinAndSelect('route.sector', 'sector')
      .where('sector.crag_id = :cragId AND route.grade IS NOT NULL', {
        cragId: crag.id,
      })
      .addSelect('route.grade')
      .addOrderBy('route.grade', 'ASC')
      .getOne()
      .then(route => {
        if (route != null && route.grade != null) return route.grade;

        return null;
      });
  }

  async getMaxGrade(crag: Crag): Promise<number> {
    return this.routesRepository
      .createQueryBuilder('route')
      .innerJoinAndSelect('route.sector', 'sector')
      .where('sector.crag_id = :cragId AND route.grade IS NOT NULL', {
        cragId: crag.id,
      })
      .addSelect('route.grade')
      .addOrderBy('route.grade', 'DESC')
      .getOne()
      .then(route => {
        if (route != null && route.grade != null) {
          return route.grade;
        }

        return null;
      });
  }

  async getPopularCrags(dateFrom: string, top: number): Promise<PopularCrag[]> {
    const builder = this.cragsRepository
      .createQueryBuilder('c')
      .addSelect('count(c.id)', 'nrvisits')
      .leftJoin('activity', 'ac', 'ac.cragId = c.id')

      .groupBy('c.id')
      .orderBy('nrvisits', 'DESC');

    if (dateFrom) {
      builder.where('ac.date >= :dateFrom', { dateFrom: dateFrom });
    }

    if (top) {
      builder.limit(top);
    }

    const rawAndEntities = await builder.getRawAndEntities();

    const popularCrags = rawAndEntities.raw.map((element, index) => {
      return {
        crag: rawAndEntities.entities[index],
        nrVisits: element.nrvisits,
      };
    });

    return popularCrags;
  }
}
