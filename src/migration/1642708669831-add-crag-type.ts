import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCragType1642708669831 implements MigrationInterface {
  name = 'addCragType1642708669831';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."crag_type_enum" AS ENUM('sport', 'alpine')`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD "type" "public"."crag_type_enum" NOT NULL DEFAULT 'sport'`,
    );
    await queryRunner.query(
      `UPDATE "crag" set "type" = 'alpine' WHERE "peakId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."crag_type_enum"`);
  }
}
