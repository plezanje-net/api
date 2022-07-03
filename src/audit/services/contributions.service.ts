import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Crag } from '../../crags/entities/crag.entity';
import { Route } from '../../crags/entities/route.entity';
import { Sector } from '../../crags/entities/sector.entity';
import { ContributablesService } from '../../crags/services/contributables.service';
import { FindContributionsServiceInput } from '../dtos/find-contributions-service.input';
import { Contribution } from '../utils/contribution.class';

@Injectable()
export class ContributionsService extends ContributablesService {
  constructor(
    @InjectRepository(Crag)
    protected cragsRepository: Repository<Crag>,
    @InjectRepository(Sector)
    protected sectorsRepository: Repository<Sector>,
    @InjectRepository(Route)
    protected routesRepository: Repository<Route>,
    private connection: Connection,
  ) {
    super(cragsRepository, sectorsRepository, routesRepository);
  }

  async find(input: FindContributionsServiceInput): Promise<Contribution[]> {
    const queryRunner = this.connection.createQueryRunner();
    const contributions = await this.getUserContributions(
      input.user,
      queryRunner,
    );
    await queryRunner.release();
    return Promise.resolve(contributions);
  }
}
