import { MigrationInterface, QueryRunner } from 'typeorm';

export class icefallGrades1641051775945 implements MigrationInterface {
  name = 'icefallGrades1641051775945';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD "grade" character varying`,
    );
    await queryRunner.query(`UPDATE "ice_fall" SET "grade" = "difficulty"`);
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD "defaultGradingSystemId" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "ice_fall" DROP COLUMN "difficulty"`);
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD "difficulty" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD CONSTRAINT "FK_d9a2eb0e6e4a8e7c3516568c355" FOREIGN KEY ("defaultGradingSystemId") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ice_fall" DROP CONSTRAINT "FK_d9a2eb0e6e4a8e7c3516568c355"`,
    );
    await queryRunner.query(`ALTER TABLE "ice_fall" DROP COLUMN "difficulty"`);
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD "difficulty" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" DROP COLUMN "defaultGradingSystemId"`,
    );
    await queryRunner.query(`ALTER TABLE "ice_fall" DROP COLUMN "grade"`);
  }
}
