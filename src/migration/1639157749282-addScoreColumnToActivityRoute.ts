import { MigrationInterface, QueryRunner } from 'typeorm';

export class addScoreColumnToActivityRoute1639157749282
  implements MigrationInterface {
  name = 'addScoreColumnToActivityRoute1639157749282';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD "score" double precision`,
    );
    await queryRunner.query(
      `UPDATE activity_route SET score = coalesce(("ascentType"='redpoint')::int * grade + ("ascentType"='onsight')::int * (100 + grade) + ("ascentType"='flash')::int * (50 + grade), 0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ALTER COLUMN "score" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activity_route" DROP COLUMN "score"`);
  }
}
