import { BaseEntity, SelectQueryBuilder } from 'typeorm';
import { InputWithUser } from '../utils/input-with-user.interface';

export class BaseService {
  setPublishStatusParams(
    builder: SelectQueryBuilder<BaseEntity>,
    alias: string,
    { user }: InputWithUser,
  ): void {
    if (!(user != null) || !user.showPrivateEntries) {
      builder.andWhere(`${alias}.publishStatus = :publishStatus`, {
        publishStatus: 'published',
      });
      return;
    }

    if (user.isAdmin()) {
      builder.andWhere(
        `(${alias}.publishStatus IN (:...publishStatuses) OR (${alias}."userId" = :userId AND ${alias}.publishStatus = :publishStatus))`,
        {
          publishStatuses: ['published', 'in_review'],
          userId: user.id,
          publishStatus: 'draft',
        },
      );
      return;
    }

    builder.andWhere(
      `(${alias}.publishStatus = :publishStatus OR ${alias}."userId" = :userId)`,
      {
        publishStatus: 'published',
        userId: user.id,
      },
    );
  }
}
