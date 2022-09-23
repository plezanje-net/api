import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getUserContributions } from '../../core/utils/contributable-helpers';
import { FindContributionsServiceInput } from '../dtos/find-contributions-service.input';
import { Contribution } from '../utils/contribution.class';

@Injectable()
export class ContributionsService {
  constructor(private dataSource: DataSource) {}

  async find(input: FindContributionsServiceInput): Promise<Contribution[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    const contributions = await getUserContributions(input.user, queryRunner);
    await queryRunner.release();
    return Promise.resolve(contributions);
  }
}
