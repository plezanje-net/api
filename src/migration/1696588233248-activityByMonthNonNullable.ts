import { MigrationInterface, QueryRunner } from 'typeorm';

export class activityByMonthNonNullable1696588233248
  implements MigrationInterface
{
  name = 'activityByMonthNonNullable1696588233248';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "crag" ALTER COLUMN "activity_by_month" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ALTER COLUMN "activity_by_month" SET DEFAULT '{0,0,0,0,0,0,0,0,0,0,0,0}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "crag" ALTER COLUMN "activity_by_month" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ALTER COLUMN "activity_by_month" DROP NOT NULL`,
    );
  }
}
