import { MigrationInterface, QueryRunner } from "typeorm";

export class addOrientationsEnumArrayField1696868866474 implements MigrationInterface {
    name = 'addOrientationsEnumArrayField1696868866474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."crag_orientations_enum" AS ENUM('north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest')`);
        await queryRunner.query(`ALTER TABLE "crag" ADD "orientations" "public"."crag_orientations_enum" array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "orientations"`);
        await queryRunner.query(`DROP TYPE "public"."crag_orientations_enum"`);
    }

}
