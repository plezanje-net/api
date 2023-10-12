import { MigrationInterface, QueryRunner } from "typeorm";

export class addSeasonsAndRainProofFields1697038709137 implements MigrationInterface {
    name = 'addSeasonsAndRainProofFields1697038709137'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."crag_seasons_enum" AS ENUM('spring', 'summer', 'autumn', 'winter')`);
        await queryRunner.query(`ALTER TABLE "crag" ADD "seasons" "public"."crag_seasons_enum" array`);
        await queryRunner.query(`ALTER TABLE "crag" ADD "rain_proof" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "rain_proof"`);
        await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "seasons"`);
        await queryRunner.query(`DROP TYPE "public"."crag_seasons_enum"`);
    }

}
