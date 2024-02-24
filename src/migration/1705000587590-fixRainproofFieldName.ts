import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixRainproofFieldName1705000587590 implements MigrationInterface {
  name = 'fixRainproofFieldName1705000587590';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "crag" RENAME COLUMN "rain_proof" TO "rainproof"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "crag" RENAME COLUMN "rainproof" TO "rain_proof"`,
    );
  }
}
