import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCragInput } from '../dtos/create-crag.input';
import { Crag } from '../entities/crag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { UpdateCragInput } from '../dtos/update-crag.input';
import { Country } from '../../crags/entities/country.entity';
import { Route } from '../entities/route.entity';
import { FindCragsServiceInput } from '../dtos/find-crags-service.input';
import { PopularCrag } from '../utils/popular-crag.class';
import slugify from 'slugify';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../core/utils/transaction.class';
import { Sector } from '../entities/sector.entity';
import { PublishStatus } from '../entities/enums/publish-status.enum';
import {
  cascadePublishStatusToRoutes,
  getPublishStatusParams,
  setPublishStatusParams,
  updateUserContributionsFlag,
} from '../../core/utils/contributable-helpers';
import { setBuilderCache } from '../../core/utils/entity-cache/entity-cache-helpers';

@Injectable()
export class CragsService {
  constructor(
    @InjectRepository(Route)
    protected routesRepository: Repository<Route>,
    @InjectRepository(Crag)
    protected cragsRepository: Repository<Crag>,
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
    private connection: Connection,
  ) {}

  async findByIds(ids: string[]): Promise<Crag[]> {
    return this.cragsRepository.findByIds(ids);
  }

  async findOne(params: FindCragsServiceInput = {}): Promise<Crag> {
    const crags = await this.find(params);

    if (crags.length == 0) {
      throw new NotFoundException();
    }

    return Promise.resolve(crags[0]);
  }

  async find(params: FindCragsServiceInput = {}): Promise<Crag[]> {
    const rawAndEntities = await this.buildQuery(params).getRawAndEntities();

    const crags = rawAndEntities.entities.map((element, index) => {
      element.routeCount = rawAndEntities.raw[index].routeCount;
      return element;
    });

    return crags;
  }

  async create(data: CreateCragInput, user: User): Promise<Crag> {
    const crag = new Crag();

    this.cragsRepository.merge(crag, data);

    crag.user = Promise.resolve(user);

    crag.country = Promise.resolve(
      await this.countryRepository.findOneOrFail(data.countryId),
    );

    crag.slug = await this.generateCragSlug(data.name);

    await this.save(crag, user);

    return Promise.resolve(crag);
  }

  async update(data: UpdateCragInput): Promise<Crag> {
    const crag = await this.cragsRepository.findOneOrFail(data.id);
    const previousPublishStatus = crag.publishStatus;

    this.cragsRepository.merge(crag, data);

    crag.slug = await this.generateCragSlug(crag.name, crag.id);

    await this.save(
      crag,
      await crag.user,
      data.cascadePublishStatus ? previousPublishStatus : null,
    );

    return Promise.resolve(crag);
  }

  private async save(
    crag: Crag,
    user: User,
    cascadeFromPublishStatus: PublishStatus = null,
  ) {
    const transaction = new Transaction(this.connection);
    await transaction.start();

    try {
      await transaction.save(crag);
      if (cascadeFromPublishStatus != null) {
        await this.cascadePublishStatusToSectors(
          crag,
          cascadeFromPublishStatus,
          transaction,
        );
      }
      await updateUserContributionsFlag(crag.publishStatus, user, transaction);
    } catch (e) {
      await transaction.rollback();
      throw e;
    }

    await transaction.commit();
  }

  private async cascadePublishStatusToSectors(
    crag: Crag,
    oldStatus: PublishStatus,
    transaction: Transaction,
  ) {
    const sectors = await transaction.queryRunner.manager.find(Sector, {
      where: {
        cragId: crag.id,
        publishStatus: oldStatus,
        userId: crag.userId,
      },
    });
    for (const sector of sectors) {
      sector.publishStatus = crag.publishStatus;
      await transaction.save(sector);
      await cascadePublishStatusToRoutes(sector, oldStatus, transaction);
    }
  }

  async delete(id: string): Promise<boolean> {
    const crag = await this.cragsRepository.findOneOrFail(id);

    const transaction = new Transaction(this.connection);
    await transaction.start();

    try {
      const user = await crag.user;
      await transaction.delete(crag);
      await updateUserContributionsFlag(null, user, transaction);
    } catch (e) {
      await transaction.rollback();
      throw e;
    }

    await transaction.commit();

    return Promise.resolve(true);
  }

  private buildQuery(
    params: FindCragsServiceInput = {},
  ): SelectQueryBuilder<Crag> {
    const builder = this.cragsRepository.createQueryBuilder('c');

    builder.orderBy('c.name COLLATE "utf8_slovenian_ci"', 'ASC');

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

    if (params.type != null) {
      builder.andWhere('c.type = :type', {
        type: params.type,
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

    if (params.areaSlug != null) {
      builder.innerJoin('c.area', 'area', 'area.slug = :areaSlug', {
        areaSlug: params.areaSlug,
      });
    }

    if (!(params.user != null)) {
      builder.andWhere('c.isHidden = false');
    }

    setPublishStatusParams(builder, 'c', params);

    const { conditions, params: joinParams } = getPublishStatusParams(
      'route',
      params.user,
    );
    builder
      .leftJoin('c.routes', 'route', conditions, joinParams)
      .groupBy('c.id');
    builder.addSelect('COUNT(route.id)', 'routeCount');

    if (params.routeTypeId != null) {
      builder.andWhere('(route.routeTypeId = :routeTypeId)', {
        routeTypeId: params.routeTypeId,
      });
    }

    setBuilderCache(builder);

    return builder;
  }

  async getNumberOfRoutes(crag: Crag, user: User): Promise<number> {
    const builder = this.routesRepository
      .createQueryBuilder('route')
      .select('COUNT(DISTINCT(route.id))', 'count')
      .where('route."cragId" = :cragId', { cragId: crag.id });

    setPublishStatusParams(builder, 'route', { user });

    setBuilderCache(builder, 'getRawOne');
    const itemCount = await builder.getRawOne();
    return itemCount.count;
  }

  async getPopularCrags(
    dateFrom: string,
    top: number,
    showHiddenCrags: boolean,
  ): Promise<PopularCrag[]> {
    const builder = this.cragsRepository
      .createQueryBuilder('c')
      .addSelect('count(c.id)', 'nrvisits')
      .leftJoin('activity', 'ac', 'ac.cragId = c.id')
      .where("c.publishStatus = 'published'")
      .groupBy('c.id')
      .orderBy('nrvisits', 'DESC');

    if (!showHiddenCrags) {
      builder.andWhere('c.isHidden = false');
    }

    if (dateFrom) {
      builder.andWhere('ac.date >= :dateFrom', { dateFrom: dateFrom });
    }

    if (top) {
      builder.limit(top);
    }

    setBuilderCache(builder, 'getRawAndEntities');

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
    const builder = this.routesRepository
      .createQueryBuilder('r')
      .select([
        'EXTRACT(month FROM ar.date) -1 as month',
        'cast (count(ar.id) as int) as visits',
      ])
      .innerJoin('activity_route', 'ar', 'ar.routeId = r.id')
      .where('r.cragId = :cid', { cid: crag.id })
      .groupBy('EXTRACT(month FROM ar.date)')
      .orderBy('EXTRACT(month FROM ar.date)', 'ASC');

    setBuilderCache(builder, 'getRawMany');

    const results = await builder.getRawMany();

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
