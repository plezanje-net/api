import { MigrationInterface, QueryRunner } from "typeorm";

export class addWallAnglesEnumArrayField1696963335256 implements MigrationInterface {
    name = 'addWallAnglesEnumArrayField1696963335256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."crag_wall_angles_enum" AS ENUM('slab', 'vertical', 'overhang', 'roof')`);
        await queryRunner.query(`ALTER TABLE "crag" ADD "wall_angles" "public"."crag_wall_angles_enum" array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "wall_angles"`);
        await queryRunner.query(`DROP TYPE "public"."crag_wall_angles_enum"`);
    }

}
