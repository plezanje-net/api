import { MigrationInterface, QueryRunner } from "typeorm";

export class addCustomActivityType1736070773650 implements MigrationInterface {
    name = 'addCustomActivityType1736070773650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."activity_route_route_id_index"`);
        await queryRunner.query(`ALTER TABLE "activity" ADD "custom_type" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "custom_type"`);
        await queryRunner.query(`CREATE INDEX "activity_route_route_id_index" ON "activity_route" ("route_id") `);
    }

}
