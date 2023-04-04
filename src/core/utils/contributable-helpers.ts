import {
  BaseEntity,
  ObjectLiteral,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Contribution } from '../../audit/utils/contribution.class';
import { Transaction } from '../../core/utils/transaction.class';
import { Crag } from '../../crags/entities/crag.entity';
import { PublishStatus } from '../../crags/entities/enums/publish-status.enum';
import { Route } from '../../crags/entities/route.entity';
import { Sector } from '../../crags/entities/sector.entity';
import { InputWithUser } from '../../crags/utils/input-with-user.interface';
import { User } from '../../users/entities/user.entity';

async function setPublishStatusParams(
  builder: SelectQueryBuilder<BaseEntity>,
  alias: string,
  { user }: InputWithUser,
): Promise<void> {
  const { conditions, params } = await getPublishStatusParams(alias, user);
  builder.andWhere(conditions, params);
}

async function getPublishStatusParams(
  alias: string,
  user: User,
): Promise<{ conditions: string; params: ObjectLiteral }> {
  if (user != null && (await user.isAdmin())) {
    return {
      conditions: `(${alias}.publishStatus IN (:...publishStatuses) OR (${alias}.user_id = :userId AND ${alias}.publishStatus = :publishStatus))`,
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
    conditions: `(${alias}.publishStatus = :publishStatus OR ${alias}.user_id = :userId)`,
    params: {
      publishStatus: 'published',
      userId: user.id,
    },
  };
}

async function cascadePublishStatusToRoutes(
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

async function updateUserContributionsFlag(
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
    !(await userHasContributions(user, transaction))
  ) {
    user.hasUnpublishedContributions = false;
    await transaction.save(user);
  }
}

async function userHasContributions(
  user: User,
  transaction: Transaction,
): Promise<boolean> {
  return (await getUserContributions(user, transaction.queryRunner)).length > 0;
}

async function getUserContributions(
  user: User,
  queryRunner: QueryRunner,
): Promise<Contribution[]> {
  const queries = [
    [queryRunner.connection.getRepository(Crag), 'crag'],
    [queryRunner.connection.getRepository(Sector), 'sector'],
    [queryRunner.connection.getRepository(Route), 'route'],
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
          'user_id',
          'publish_status::text',
        ])
        .where(
          user.isAdmin()
            ? `publish_status = 'in_review' OR (publish_status = 'draft' AND user_id = '${user.id}')`
            : `(publish_status = 'in_review' OR publish_status = 'draft') AND user_id = '${user.id}'`,
        )
        .getQuery(),
    )
    .join(' union ');

  const contributions = await queryRunner.query(
    `(${union}) order by created desc`,
  );

  return Promise.resolve(contributions);
}

export {
  setPublishStatusParams,
  getPublishStatusParams,
  cascadePublishStatusToRoutes,
  updateUserContributionsFlag,
  userHasContributions,
  getUserContributions,
};
