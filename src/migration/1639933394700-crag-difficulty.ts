import {MigrationInterface, QueryRunner} from "typeorm";

export class cragDifficulty1639933394700 implements MigrationInterface {
    name = 'cragDifficulty1639933394700'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "minGrade"`);
        await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "maxGrade"`);
        await queryRunner.query(`ALTER TABLE "crag" ADD "minDifficulty" double precision`);
        await queryRunner.query(`ALTER TABLE "crag" ADD "maxDifficulty" double precision`);
        await queryRunner.query(`ALTER TABLE "crag" ADD "defaultGradingSystemId" character varying`);
        await queryRunner.query(`ALTER TABLE "crag" ADD CONSTRAINT "FK_bdb8b8fdb931dc23ccfc234bde1" FOREIGN KEY ("defaultGradingSystemId") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crag" DROP CONSTRAINT "FK_bdb8b8fdb931dc23ccfc234bde1"`);
        await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "defaultGradingSystemId"`);
        await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "maxDifficulty"`);
        await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "minDifficulty"`);
        await queryRunner.query(`ALTER TABLE "crag" ADD "maxGrade" character varying`);
        await queryRunner.query(`ALTER TABLE "crag" ADD "minGrade" character varying`);
    }

}
