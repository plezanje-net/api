import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetCragDefaultGradingSystemId1640116576110
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        WITH sq AS (
            SELECT DISTINCT ON (c.id) c.id AS cragid, COUNT(r."defaultGradingSystemId") AS gsidcount, gs.id AS gsid
            FROM crag c
            LEFT JOIN route r ON c.id = r."cragId"
            LEFT JOIN grading_system gs ON r."defaultGradingSystemId" = gs.id
            GROUP BY gs.id, c.id, c.name
            ORDER BY c.id, gsidcount desc, gs.position
        )
        UPDATE crag uc
        SET "defaultGradingSystemId" = sq.gsid
        FROM sq
        WHERE sq.cragid = uc.id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE crag
        SET "defaultGradingSystemId" =  null
    `);
  }
}
