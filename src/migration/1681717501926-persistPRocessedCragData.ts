import { MigrationInterface, QueryRunner } from "typeorm";

export class persistPRocessedCragData1681717501926 implements MigrationInterface {
    name = 'persistPRocessedCragData1681717501926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "route" ADD "nr_ticks" integer`);
        await queryRunner.query(`ALTER TABLE "route" ADD "nr_tries" integer`);
        await queryRunner.query(`ALTER TABLE "route" ADD "nr_climbers" integer`);
        await queryRunner.query(`ALTER TABLE "crag" ADD "activity_by_month" integer array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "activity_by_month"`);
        await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "nr_climbers"`);
        await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "nr_tries"`);
        await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "nr_ticks"`);
    }

}
