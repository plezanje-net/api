import { BaseEntity, SelectQueryBuilder } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EntityStatus } from '../entities/enums/entity-status.enum';
import { EntityStatusInput } from '../utils/entity-status-input.interface';

export class BaseService {
  setEntityStatusParams(
    builder: SelectQueryBuilder<BaseEntity>,
    alias: string,
    { user }: EntityStatusInput,
  ): void {
    let statusQuery = `${alias}.status <= :minStatus`;
    let statusParams: any = {
      minStatus: this.getMinEntityStatus(user),
    };
    if (user != null && user.showPrivateEntries) {
      statusQuery = `(${statusQuery} OR (
          (${alias}.status = 'user' OR ${alias}.status = 'proposal') AND (${alias}."userId" = :userId)
        ))`;
      statusParams = {
        minStatus: statusParams.minStatus,
        userId: user.id,
      };
    }
    builder.andWhere(statusQuery, statusParams);
  }

  getMinEntityStatus(user?: User): EntityStatus {
    if (user == null) {
      return EntityStatus.PUBLIC;
    }
    if (!user.isAdmin()) {
      return EntityStatus.HIDDEN;
    }
    if (user.showPrivateEntries) {
      return EntityStatus.PROPOSAL;
    }
    return EntityStatus.ARCHIVE;
  }
}
