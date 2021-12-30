import { MigrationInterface, QueryRunner } from 'typeorm';

export class convertBoulderFlashToOnsight1640769431575
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        WITH issightiswrong AS (
            SELECT ar.id
            FROM activity_route ar
            LEFT JOIN route r ON ar."routeId" = r.id
            WHERE r."routeTypeId" = 'boulder'
            AND ar."ascentType" = 'onsight'
        )
        UPDATE activity_route ar
        SET "ascentType" = 'flash'
        FROM issightiswrong
        WHERE ar.id = issightiswrong.id;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        WITH isflashtowrongsight AS (
            SELECT ar.id
            FROM activity_route ar
            LEFT JOIN route r on r.id = ar."routeId"
            WHERE r."routeTypeId" = 'boulder'
            AND ar."ascentType" = 'flash'
            AND (ar.legacy::json -> 'AscentType')::jsonb = '"S"'::jsonb
        )
        UPDATE activity_route ar
        SET "ascentType" = 'onsight'
        FROM isflashtowrongsight
        WHERE ar.id = isflashtowrongsight.id;
      `);
  }
}
