import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sector } from '../entities/sector.entity';
import {
  Connection,
  MoreThanOrEqual,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { UpdateSectorInput } from '../dtos/update-sector.input';
import { CreateSectorInput } from '../dtos/create-sector.input';
import { Route } from '../entities/route.entity';
import { User } from '../../users/entities/user.entity';
import { FindSectorsServiceInput } from '../dtos/find-sectors-service.input';
import { Transaction } from '../../core/utils/transaction.class';
import { PublishStatus } from '../entities/enums/publish-status.enum';
import {
  cascadePublishStatusToRoutes,
  setPublishStatusParams,
  updateUserContributionsFlag,
} from '../../core/utils/contributable-helpers';
import { setBuilderCache } from '../../core/utils/entity-cache/entity-cache-helpers';

@Injectable()
export class SectorsService {
  constructor(
    @InjectRepository(Sector)
    protected sectorsRepository: Repository<Sector>,
    @InjectRepository(Route)
    protected routesRepository: Repository<Route>,
    private connection: Connection,
  ) {}

  async find(input: FindSectorsServiceInput): Promise<Sector[]> {
    return this.buildQuery(input).getMany();
  }
  async findOne(input: FindSectorsServiceInput): Promise<Sector> {
    return this.buildQuery(input).getOneOrFail();
  }

  async findOneById(id: string): Promise<Sector> {
    return this.buildQuery({ id: id }).getOneOrFail();
  }

  async create(data: CreateSectorInput, user: User): Promise<Sector> {
    const sector = new Sector();

    this.sectorsRepository.merge(sector, data);

    sector.user = Promise.resolve(user);

    return this.save(sector, user);
  }

  async update(data: UpdateSectorInput): Promise<Sector> {
    const sector = await this.sectorsRepository.findOneByOrFail({
      id: data.id,
    });
    const previousPublishStatus = sector.publishStatus;

    this.sectorsRepository.merge(sector, data);

    return this.save(
      sector,
      await sector.user,
      data.cascadePublishStatus ? previousPublishStatus : null,
    );
  }

  async delete(id: string): Promise<boolean> {
    const sector = await this.sectorsRepository.findOneByOrFail({ id });

    const transaction = new Transaction(this.connection);
    await transaction.start();

    try {
      const user = await sector.user;
      await transaction.delete(sector);
      await updateUserContributionsFlag(null, user, transaction);
    } catch (e) {
      await transaction.rollback();
      throw e;
    }

    await transaction.commit();

    return Promise.resolve(true);
  }

  async bouldersOnly(sectorId: string): Promise<boolean> {
    const cnt = this.routesRepository.countBy({
      sectorId: sectorId,
      routeTypeId: Not('boulder'),
    });

    return cnt.then(cnt => !cnt);
  }

  private async save(
    sector: Sector,
    user: User,
    cascadeFromPublishStatus: PublishStatus = null,
  ) {
    const transaction = new Transaction(this.connection);
    await transaction.start();

    try {
      await transaction.save(sector);
      await this.shiftFollowingSectors(sector, transaction);
      if (cascadeFromPublishStatus != null) {
        await cascadePublishStatusToRoutes(
          sector,
          cascadeFromPublishStatus,
          transaction,
        );
      }
      await updateUserContributionsFlag(
        sector.publishStatus,
        user,
        transaction,
      );
    } catch (e) {
      await transaction.rollback();
      throw e;
    }

    await transaction.commit();

    return Promise.resolve(sector);
  }

  private async shiftFollowingSectors(
    sector: Sector,
    transaction: Transaction,
  ) {
    const followingSectors = await transaction.queryRunner.manager.find(
      Sector,
      {
        where: {
          cragId: sector.cragId,
          position: MoreThanOrEqual(sector.position),
          id: Not(sector.id),
        },
        order: {
          position: 'ASC',
        },
      },
    );

    if (
      followingSectors.length > 0 &&
      followingSectors[0].position == sector.position
    ) {
      for (let offset = 0; offset < followingSectors.length; offset++) {
        followingSectors[offset].position = sector.position + offset + 1;
        await transaction.save(followingSectors[offset]);
      }
    }
  }

  private buildQuery(
    params: FindSectorsServiceInput = {},
  ): SelectQueryBuilder<Sector> {
    const builder = this.sectorsRepository.createQueryBuilder('s');

    builder.orderBy('s.position', 'ASC');

    if (params.cragId != null) {
      builder.andWhere('s.crag = :cragId', {
        cragId: params.cragId,
      });
    }

    if (params.id != null) {
      builder.andWhere('s.id = :id', {
        id: params.id,
      });
    }

    setPublishStatusParams(builder, 's', params);

    setBuilderCache(builder);

    return builder;
  }
}
