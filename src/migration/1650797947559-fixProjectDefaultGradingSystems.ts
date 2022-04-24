import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixProjectDefaultGradingSystems1650797947559
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Set projects' default grading system to the default grading system of a crag that the project (route) belongs to
    await queryRunner.query(`
        WITH gs AS (
            SELECT r.id AS rid, c."defaultGradingSystemId" AS gsid
            FROM route r
            LEFT JOIN crag c ON r."cragId" = c.id
            WHERE r."isProject" = TRUE
        )
        UPDATE route ur SET
        "defaultGradingSystemId" = gs.gsid
        FROM gs
        WHERE ur.id = gs.rid;
    `);
  }

  public async down(): Promise<void> {
    return null;
  }
}
