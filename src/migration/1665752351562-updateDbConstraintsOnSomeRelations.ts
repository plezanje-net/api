import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateDbConstraintsOnSomeRelations1665752351562
  implements MigrationInterface
{
  name = 'updateDbConstraintsOnSomeRelations1665752351562';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "peak" DROP CONSTRAINT "FK_53a36c2642b09e474534a5c13d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" ALTER COLUMN "countryId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" DROP CONSTRAINT "FK_6a195788507dd2367e76bfdadf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ALTER COLUMN "countryId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" DROP CONSTRAINT "FK_cae1d5b69fc10cb70c83f348702"`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" ALTER COLUMN "countryId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" DROP CONSTRAINT "FK_42c68e444fd3ec48f66854897e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" DROP CONSTRAINT "UQ_94157d2971371af83a760bd0c3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ALTER COLUMN "routeId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ADD CONSTRAINT "UQ_94157d2971371af83a760bd0c3a" UNIQUE ("routeId", "userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" ADD CONSTRAINT "FK_53a36c2642b09e474534a5c13d3" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD CONSTRAINT "FK_6a195788507dd2367e76bfdadf0" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" ADD CONSTRAINT "FK_cae1d5b69fc10cb70c83f348702" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ADD CONSTRAINT "FK_42c68e444fd3ec48f66854897e9" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" DROP CONSTRAINT "FK_42c68e444fd3ec48f66854897e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" DROP CONSTRAINT "FK_cae1d5b69fc10cb70c83f348702"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" DROP CONSTRAINT "FK_6a195788507dd2367e76bfdadf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" DROP CONSTRAINT "FK_53a36c2642b09e474534a5c13d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" DROP CONSTRAINT "UQ_94157d2971371af83a760bd0c3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ALTER COLUMN "routeId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ADD CONSTRAINT "UQ_94157d2971371af83a760bd0c3a" UNIQUE ("userId", "routeId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ADD CONSTRAINT "FK_42c68e444fd3ec48f66854897e9" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" ALTER COLUMN "countryId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" ADD CONSTRAINT "FK_cae1d5b69fc10cb70c83f348702" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ALTER COLUMN "countryId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD CONSTRAINT "FK_6a195788507dd2367e76bfdadf0" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" ALTER COLUMN "countryId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" ADD CONSTRAINT "FK_53a36c2642b09e474534a5c13d3" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
