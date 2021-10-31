import { Injectable } from '@nestjs/common';
import { CreateCragInput } from '../dtos/create-crag.input';
import { Crag } from '../entities/crag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  MoreThanOrEqual,
  IsNull,
  SelectQueryBuilder,
} from 'typeorm';
import { UpdateCragInput } from '../dtos/update-crag.input';
import { Country } from '../../crags/entities/country.entity';
import { Route } from '../entities/route.entity';
import { Area } from '../entities/area.entity';
import { FindCragsInput } from '../dtos/find-crags.input';

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
    return this.buildQuery(params).getMany();
  }

  // async find(params: {
  //   country?: string;
  //   area?: string;
  //   minStatus?: number;
  // }): Promise<Crag[]> {
  //   const options: FindManyOptions = {
  //     order: {
  //       name: 'ASC',
  //     },
  //   };

  //   const where: any = { peak: IsNull() };

  //   if (params.country != null) {
  //     where.country = params.country;
  //   }

  //   if (params.area != null) {
  //     where.area = params.area;
  //   }

  //   if (params.minStatus != null) {
  //     where.status = MoreThanOrEqual(params.minStatus);
  //   }

  //   where.__routes__ = { type: 'boulder' };

  //   options.where = where;

  //   // options.join = {
  //   //   alias: 'route',
  //   //   innerJoinAndSelect: {
  //   //     routeType: 'route.type',
  //   //   },
  //   // };

  //   // options.join = {
  //   //   alias: 'crag',
  //   //   innerJoinAndSelect: {
  //   //     routes: 'crag.routes',
  //   //   },
  //   // };

  //   options.relations = ['routes'];
  //   // options.where.routes

  //   const l = this.cragsRepository.find(options);
  //   console.log(await l);

  //   return this.cragsRepository
  //   .createQueryBuilder('crag')
  //   .getMany();
  // }

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

    builder.andWhere('c."peakId" IS NULL');

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
      let condition = 'route.type = :routeType';

      if (params.routeType == 'sport') {
        condition += ' OR route.type IS NULL';
      }

      builder
        .leftJoin('c.routes', 'route')
        .andWhere('route.status > 0')
        .andWhere('(' + condition + ')', { routeType: params.routeType })
        .groupBy('c.id');

      builder.addSelect('COUNT(route.id) AS routeCount');
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
}
