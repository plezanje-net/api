import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { getUserContributions } from '../../core/utils/contributable-helpers';
import { FindContributionsServiceInput } from '../dtos/find-contributions-service.input';
import { Contribution } from '../utils/contribution.class';

@Injectable()
export class ContributionsService {
  constructor(private connection: Connection) {}

  async find(input: FindContributionsServiceInput): Promise<Contribution[]> {
    const queryRunner = this.connection.createQueryRunner();
    const contributions = await getUserContributions(input.user, queryRunner);
    await queryRunner.release();
    return Promise.resolve(contributions);
  }
}
