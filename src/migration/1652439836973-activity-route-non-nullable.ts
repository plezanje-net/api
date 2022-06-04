import { MigrationInterface, QueryRunner } from 'typeorm';

export class activityRouteNonNullable1652439836973
  implements MigrationInterface {
  name = 'activityRouteNonNullable1652439836973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP CONSTRAINT "FK_ebb17ba34f1d7783c1c146d062e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ALTER COLUMN "routeId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD CONSTRAINT "FK_ebb17ba34f1d7783c1c146d062e" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP CONSTRAINT "FK_ebb17ba34f1d7783c1c146d062e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ALTER COLUMN "routeId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD CONSTRAINT "FK_ebb17ba34f1d7783c1c146d062e" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
