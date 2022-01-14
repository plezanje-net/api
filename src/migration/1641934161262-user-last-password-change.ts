import {MigrationInterface, QueryRunner} from "typeorm";

export class userLastPasswordChange1641934161262 implements MigrationInterface {
    name = 'userLastPasswordChange1641934161262'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "lastPasswordChange" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastPasswordChange"`);
    }

}
