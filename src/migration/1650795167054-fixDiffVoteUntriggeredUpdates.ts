import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixDiffVoteUntriggeredUpdates1650795167054
  implements MigrationInterface {
  name = 'fixDiffVoteUntriggeredUpdates1650795167054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // This dummy query will 'touch' every difficulty vote, effectivelly recalculating all routes' difficulties.
    await queryRunner.query(
      `UPDATE difficulty_vote SET difficulty = difficulty`,
    );
  }

  public async down(): Promise<void> {
    return null;
  }
}
