import { MigrationInterface, QueryRunner } from "typeorm";

export class addCoverImageFieldCrag1697179836611 implements MigrationInterface {
    name = 'addCoverImageFieldCrag1697179836611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crag" ADD "cover_image_id" uuid`);
        await queryRunner.query(`ALTER TABLE "crag" ADD CONSTRAINT "UQ_92ec8a92a0d6a2c152ed6b47e90" UNIQUE ("cover_image_id")`);
        await queryRunner.query(`ALTER TABLE "crag" ADD CONSTRAINT "FK_92ec8a92a0d6a2c152ed6b47e90" FOREIGN KEY ("cover_image_id") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crag" DROP CONSTRAINT "FK_92ec8a92a0d6a2c152ed6b47e90"`);
        await queryRunner.query(`ALTER TABLE "crag" DROP CONSTRAINT "UQ_92ec8a92a0d6a2c152ed6b47e90"`);
        await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "cover_image_id"`);
    }

}
