import { MigrationInterface, QueryRunner } from 'typeorm';

export class roundCragCoordinates1643296210232 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `update crag set lat = round(cast(lat as numeric),5) where lat is not null`,
    );
    await queryRunner.query(
      `update crag set lon = round(cast(lon as numeric),5) where lon is not null`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    Promise.resolve(null);
  }
}
