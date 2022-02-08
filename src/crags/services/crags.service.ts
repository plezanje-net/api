import { Injectable } from '@nestjs/common';
import { CreateCragInput } from '../dtos/create-crag.input';
import { Crag, CragStatus } from '../entities/crag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, SelectQueryBuilder } from 'typeorm';
import { UpdateCragInput } from '../dtos/update-crag.input';
import { Country } from '../../crags/entities/country.entity';
import { Route } from '../entities/route.entity';
import { Area } from '../entities/area.entity';
import { FindCragsInput } from '../dtos/find-crags.input';
import { PopularCrag } from '../utils/popular-crag.class';
import slugify from 'slugify';
import { GradingSystem } from '../entities/grading-system.entity';

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
    @InjectRepository(GradingSystem)
    private gradingSystemRepository: Repository<GradingSystem>,
  ) {}

  async findOneById(id: string): Promise<Crag> {
    return this.cragsRepository.findOneOrFail(id);
  }

  async findOneBySlug(slug: string): Promise<Crag> {
    return this.cragsRepository.findOneOrFail({ slug: slug });
  }

  async findOne(params: FindCragsInput = {}): Promise<Crag> {
    return this.buildQuery(params).getOneOrFail();
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

    crag.slug = await this.generateCragSlug(data.name);

    return this.cragsRepository.save(crag);
  }

  async update(data: UpdateCragInput): Promise<Crag> {
    const crag = await this.cragsRepository.findOneOrFail(data.id);

    this.cragsRepository.merge(crag, data);

    crag.slug = await this.generateCragSlug(crag.name, crag.id);

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

    if (params.peakId != null) {
      builder.andWhere('c.peak = :peakId', {
        peakId: params.peakId,
      });
    }

    if (params.id != null) {
      builder.andWhere('c.id = :id', {
        id: params.id,
      });
    }

    if (params.slug != null) {
      builder.andWhere('c.slug = :slug', {
        slug: params.slug,
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

    if (params.routeTypeId != null) {
      builder
        .innerJoin('c.routes', 'route')
        .andWhere('(route.routeTypeId = :routeTypeId)', {
          routeTypeId: params.routeTypeId,
        })
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
        if (route != null && route.difficulty != null) return route.difficulty;

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
        if (route != null && route.difficulty != null) {
          return route.difficulty;
        }

        return null;
      });
  }

  async getPopularCrags(
    dateFrom: string,
    top: number,
    minStatus: CragStatus,
  ): Promise<PopularCrag[]> {
    const builder = this.cragsRepository
      .createQueryBuilder('c')
      .addSelect('count(c.id)', 'nrvisits')
      .leftJoin('activity', 'ac', 'ac.cragId = c.id')
      .where('c.status <= :minStatus', {
        minStatus: minStatus,
      })
      .groupBy('c.id')
      .orderBy('nrvisits', 'DESC');

    if (dateFrom) {
      builder.andWhere('ac.date >= :dateFrom', { dateFrom: dateFrom });
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

  async getAcitivityByMonth(crag: Crag): Promise<number[]> {
    const results = await this.routesRepository
      .createQueryBuilder('r')
      .select([
        'EXTRACT(month FROM ar.date) -1 as month',
        'cast (count(ar.id) as int) as visits',
      ])
      .innerJoin('activity_route', 'ar', 'ar.routeId = r.id')
      .where('r.cragId = :cid', { cid: crag.id })
      .groupBy('EXTRACT(month FROM ar.date)')
      .orderBy('EXTRACT(month FROM ar.date)', 'ASC')
      .getRawMany();

    const response = new Array(12).fill(0);

    results.forEach(r => {
      response[r.month] = r.visits;
    });

    return response;
  }

  private async generateCragSlug(cragName: string, selfId?: string) {
    const selfCond = selfId != null ? { id: Not(selfId) } : {};
    let slug = slugify(cragName, { lower: true });
    let suffixCounter = 0;
    let suffix = '';

    while (
      (await this.cragsRepository.findOne({
        where: { ...selfCond, slug: slug + suffix },
      })) !== undefined
    ) {
      suffixCounter++;
      suffix = '-' + suffixCounter;
    }
    slug += suffix;

    return slug;
  }
}
