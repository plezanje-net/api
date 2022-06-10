import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, In, Repository } from 'typeorm';
import { Crag } from '../../crags/entities/crag.entity';
import { Route } from '../../crags/entities/route.entity';
import { Sector } from '../../crags/entities/sector.entity';
import { BaseService } from '../../crags/services/base.service';
import { FindContributionsServiceInput } from '../dtos/find-contributions-service.input';
import { Contribution } from '../utils/contribution.class';

@Injectable()
export class ContributionsService extends BaseService {
  constructor(
    @InjectRepository(Crag)
    private cragsRepository: Repository<Crag>,
    @InjectRepository(Sector)
    private sectorsRepository: Repository<Sector>,
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
  ) {
    super();
  }

  async find(input: FindContributionsServiceInput): Promise<Contribution[]> {
    const entityManager = getManager();

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
            input.user.isAdmin()
              ? `"publishStatus" = 'in_review' OR ("publishStatus" = 'draft' AND "userId" = '${input.user.id}')`
              : `("publishStatus" = 'in_review' OR "publishStatus" = 'draft') AND "userId" = '${input.user.id}'`,
          )
          .getQuery(),
      )
      .join(' union ');

    const contributions = await entityManager.query(
      `(${union}) order by created desc limit 20`,
    );

    return Promise.resolve(contributions);
  }
}
