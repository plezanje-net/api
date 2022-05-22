import { BaseEntity, SelectQueryBuilder } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EntityStatus } from '../entities/enums/entity-status.enum';
import { EntityStatusInput } from '../utils/entity-status-input.interface';

export class BaseService {
  setEntityStatusParams(
    builder: SelectQueryBuilder<BaseEntity>,
    alias: string,
    { user, showPrivate }: EntityStatusInput,
  ): void {
    let statusQuery = `${alias}.status <= :minStatus`;
    let statusParams: any = {
      minStatus: this.getMinEntityStatus(user),
    };
    if (user != null && showPrivate) {
      statusQuery = `(${statusQuery} OR (
          (${alias}.status = 'user' OR ${alias}.status = 'proposal') AND (${alias}."userId" = :userId)
        ))`;
      statusParams = {
        ...statusParams,
        userId: user.id,
      };
    }
    builder.andWhere(statusQuery, statusParams);
  }

  getMinEntityStatus(user?: User): EntityStatus {
    if (user != null) {
      return user.isAdmin() ? EntityStatus.ARCHIVE : EntityStatus.HIDDEN;
    }
    return EntityStatus.PUBLIC;
  }
}
