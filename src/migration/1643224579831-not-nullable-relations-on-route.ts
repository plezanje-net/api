import {MigrationInterface, QueryRunner} from "typeorm";

export class notNullableRelationsOnRoute1643224579831 implements MigrationInterface {
    name = 'notNullableRelationsOnRoute1643224579831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "FK_8720c83b6fdffcead06dd220703"`);
        await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "FK_6ee50bb725ec5b94b0a2f988331"`);
        await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "UQ_dfed6177fa5752c50fafce148f7"`);
        await queryRunner.query(`ALTER TABLE "route" ALTER COLUMN "defaultGradingSystemId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "route" ALTER COLUMN "cragId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "route" ADD CONSTRAINT "UQ_dfed6177fa5752c50fafce148f7" UNIQUE ("slug", "cragId")`);
        await queryRunner.query(`ALTER TABLE "route" ADD CONSTRAINT "FK_8720c83b6fdffcead06dd220703" FOREIGN KEY ("defaultGradingSystemId") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "route" ADD CONSTRAINT "FK_6ee50bb725ec5b94b0a2f988331" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "FK_6ee50bb725ec5b94b0a2f988331"`);
        await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "FK_8720c83b6fdffcead06dd220703"`);
        await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "UQ_dfed6177fa5752c50fafce148f7"`);
        await queryRunner.query(`ALTER TABLE "route" ALTER COLUMN "cragId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "route" ALTER COLUMN "defaultGradingSystemId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "route" ADD CONSTRAINT "UQ_dfed6177fa5752c50fafce148f7" UNIQUE ("cragId", "slug")`);
        await queryRunner.query(`ALTER TABLE "route" ADD CONSTRAINT "FK_6ee50bb725ec5b94b0a2f988331" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "route" ADD CONSTRAINT "FK_8720c83b6fdffcead06dd220703" FOREIGN KEY ("defaultGradingSystemId") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
