import { MigrationInterface, QueryRunner } from "typeorm";

export class addApproachTimeField1696876275575 implements MigrationInterface {
    name = 'addApproachTimeField1696876275575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crag" ADD "approach_time" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "approach_time"`);
    }

}
