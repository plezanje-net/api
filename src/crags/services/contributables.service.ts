import {
  BaseEntity,
  ObjectLiteral,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Contribution } from '../../audit/utils/contribution.class';
import { Transaction } from '../../core/utils/transaction.class';
import { User } from '../../users/entities/user.entity';
import { Crag } from '../entities/crag.entity';
import { PublishStatus } from '../entities/enums/publish-status.enum';
import { Route } from '../entities/route.entity';
import { Sector } from '../entities/sector.entity';
import { InputWithUser } from '../utils/input-with-user.interface';

export class ContributablesService {
  constructor(
    protected cragsRepository: Repository<Crag>,
    protected sectorsRepository: Repository<Sector>,
    protected routesRepository: Repository<Route>,
  ) {}

  protected setPublishStatusParams(
    builder: SelectQueryBuilder<BaseEntity>,
    alias: string,
    { user }: InputWithUser,
  ): void {
    const { conditions, params } = this.getPublishStatusParams(alias, user);
    builder.andWhere(conditions, params);
  }

  protected getPublishStatusParams(
    alias: string,
    user: User,
  ): { conditions: string; params: ObjectLiteral } {
    if (user != null && user.isAdmin()) {
      return {
        conditions: `(${alias}.publishStatus IN (:...publishStatuses) OR (${alias}."userId" = :userId AND ${alias}.publishStatus = :publishStatus))`,
        params: {
          publishStatuses: ['published', 'in_review'],
          userId: user.id,
          publishStatus: 'draft',
        },
      };
    }

    if (user == null || !user.hasUnpublishedContributions) {
      return {
        conditions: `${alias}.publishStatus = :publishStatus`,
        params: {
          publishStatus: 'published',
        },
      };
    }

    return {
      conditions: `(${alias}.publishStatus = :publishStatus OR ${alias}."userId" = :userId)`,
      params: {
        publishStatus: 'published',
        userId: user.id,
      },
    };
  }

  protected async cascadePublishStatusToRoutes(
    sector: Sector,
    oldStatus: PublishStatus,
    transaction: Transaction,
  ) {
    const routes = await transaction.queryRunner.manager.find(Route, {
      where: {
        sectorId: sector.id,
        publishStatus: oldStatus,
        userId: sector.userId,
      },
    });
    for (const route of routes) {
      route.publishStatus = sector.publishStatus;
      await transaction.save(route);
    }
  }

  async updateUserContributionsFlag(
    status: PublishStatus,
    user: User,
    transaction: Transaction,
  ) {
    if (user == null) {
      return Promise.resolve();
    }

    if (
      (status == 'draft' || status == 'in_review') &&
      !user.hasUnpublishedContributions
    ) {
      user.hasUnpublishedContributions = true;
      await transaction.save(user);
    }

    if (
      (status == null || status == 'published') &&
      user.hasUnpublishedContributions &&
      !(await this.userHasContributions(user, transaction))
    ) {
      user.hasUnpublishedContributions = false;
      await transaction.save(user);
    }
  }

  private async userHasContributions(
    user: User,
    transaction: Transaction,
  ): Promise<boolean> {
    return (
      (await this.getUserContributions(user, transaction.queryRunner)).length >
      0
    );
  }

  async getUserContributions(
    user: User,
    queryRunner: QueryRunner,
  ): Promise<Contribution[]> {
    const queries = [
      [this.cragsRepository, 'crag'],
      [this.sectorsRepository, 'sector'],
      [this.routesRepository, 'route'],
    ];

    const union = queries
      .map(([repository, alias]: [Repository<any>, string]) =>
        repository
          .createQueryBuilder(alias)
          .select([
            'id',
            'name',
            'created',
            `'${alias}' as entity`,
            '"userId"',
            '"publishStatus"::text',
          ])
          .where(
            user.isAdmin()
              ? `"publishStatus" = 'in_review' OR ("publishStatus" = 'draft' AND "userId" = '${user.id}')`
              : `("publishStatus" = 'in_review' OR "publishStatus" = 'draft') AND "userId" = '${user.id}'`,
          )
          .getQuery(),
      )
      .join(' union ');

    const contributions = await queryRunner.query(
      `(${union}) order by created desc`,
    );

    return Promise.resolve(contributions);
  }
}
