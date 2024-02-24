import { MigrationInterface, QueryRunner } from 'typeorm';

export class addHasSportHasBoulderHasMultipitchToCrag1708077643082
  implements MigrationInterface
{
  name = 'addHasSportHasBoulderHasMultipitchToCrag1708077643082';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "crag" ADD "has_sport" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(
      `ALTER TABLE "crag" ADD "has_boulder" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD "has_multipitch" boolean NOT NULL DEFAULT false`,
    );

    const crags = await queryRunner.query(
      `SELECT c.id, r.route_type_id FROM crag c
        INNER JOIN route r on r.crag_id = c.id
        GROUP BY r.route_type_id, c.id`,
    );

    for (const crag of crags) {
      if (['sport', 'boulder', 'multipitch'].includes(crag.route_type_id)) {
        await queryRunner.query(
          `UPDATE crag SET has_${crag.route_type_id} = true WHERE id = '${crag.id}'`,
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "has_multipitch"`);
    await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "has_boulder"`);
    await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "has_sport"`);
  }
}
