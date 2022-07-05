import { MigrationInterface, QueryRunner } from 'typeorm';

export class routePublishStatus1654370445561 implements MigrationInterface {
  name = 'routePublishStatus1654370445561';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."crag_publishstatus_enum" AS ENUM('draft', 'in_review', 'published')`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD "publishStatus" "public"."crag_publishstatus_enum" NOT NULL DEFAULT 'published'`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD "isHidden" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sector_publishstatus_enum" AS ENUM('draft', 'in_review', 'published')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" ADD "publishStatus" "public"."sector_publishstatus_enum" NOT NULL DEFAULT 'published'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."route_publishstatus_enum" AS ENUM('draft', 'in_review', 'published')`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD "publishStatus" "public"."route_publishstatus_enum" NOT NULL DEFAULT 'published'`,
    );

    queryRunner.query(
      `UPDATE "crag" SET "isHidden" = true WHERE "status" = 'hidden'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "publishStatus"`);
    await queryRunner.query(`DROP TYPE "public"."route_publishstatus_enum"`);
    await queryRunner.query(`ALTER TABLE "sector" DROP COLUMN "publishStatus"`);
    await queryRunner.query(`DROP TYPE "public"."sector_publishstatus_enum"`);
    await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "isHidden"`);
    await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "publishStatus"`);
    await queryRunner.query(`DROP TYPE "public"."crag_publishstatus_enum"`);
  }
}
