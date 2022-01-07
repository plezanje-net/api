import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDefaultIsNotBaseToDifficultyVote1641581329593
  implements MigrationInterface {
  name = 'addDefaultIsNotBaseToDifficultyVote1641581329593';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ALTER COLUMN "isBase" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ALTER COLUMN "isBase" SET DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ALTER COLUMN "isBase" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ALTER COLUMN "isBase" DROP NOT NULL`,
    );
  }
}
