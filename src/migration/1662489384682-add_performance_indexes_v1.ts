import {MigrationInterface, QueryRunner} from "typeorm";

export class addPerformanceIndexesV11662489384682 implements MigrationInterface {
    name = 'addPerformanceIndexesV11662489384682'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_a3a13acba521462ee9dbecca6f" ON "crag" ("publishStatus") `);
        await queryRunner.query(`CREATE INDEX "IDX_2ad137396ad0d68c3879a8a45e" ON "difficulty_vote" ("created") `);
        await queryRunner.query(`CREATE INDEX "IDX_33c435f2f7a1dfe201806566e7" ON "route" ("publishStatus") `);
        await queryRunner.query(`CREATE INDEX "IDX_40864ce351fe24a7f7229b0491" ON "activity_route" ("publish", "activityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4253a621975f5dad7c4c89fd1d" ON "activity_route" ("routeId", "publish") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_4253a621975f5dad7c4c89fd1d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_40864ce351fe24a7f7229b0491"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_33c435f2f7a1dfe201806566e7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2ad137396ad0d68c3879a8a45e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a3a13acba521462ee9dbecca6f"`);
    }

}
