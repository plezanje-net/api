import {MigrationInterface, QueryRunner} from "typeorm";

export class latestWarnings1638726291100 implements MigrationInterface {
    name = 'latestWarnings1638726291100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ADD "exposedUntil" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "exposedUntil"`);
    }

}
