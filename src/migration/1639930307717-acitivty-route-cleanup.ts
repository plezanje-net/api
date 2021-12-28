import {MigrationInterface, QueryRunner} from "typeorm";

export class acitivtyRouteCleanup1639930307717 implements MigrationInterface {
    name = 'acitivtyRouteCleanup1639930307717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "grading_system_route_type" ("routeTypeId" character varying NOT NULL, "gradingSystemId" character varying NOT NULL, CONSTRAINT "PK_af82357bbf92531c8911afbcf9a" PRIMARY KEY ("routeTypeId", "gradingSystemId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fb92795cf33d418cb4a07772a3" ON "grading_system_route_type" ("routeTypeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e41703030af5829df36af0eaa5" ON "grading_system_route_type" ("gradingSystemId") `);
        await queryRunner.query(`ALTER TABLE "activity_route" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "activity_route" DROP COLUMN "difficulty"`);
        await queryRunner.query(`ALTER TABLE "activity_route" DROP COLUMN "grade"`);
        await queryRunner.query(`ALTER TABLE "activity_route" DROP COLUMN "stars"`);
        await queryRunner.query(`ALTER TABLE "grading_system_route_type" ADD CONSTRAINT "FK_fb92795cf33d418cb4a07772a38" FOREIGN KEY ("routeTypeId") REFERENCES "route_type"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "grading_system_route_type" ADD CONSTRAINT "FK_e41703030af5829df36af0eaa50" FOREIGN KEY ("gradingSystemId") REFERENCES "grading_system"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grading_system_route_type" DROP CONSTRAINT "FK_e41703030af5829df36af0eaa50"`);
        await queryRunner.query(`ALTER TABLE "grading_system_route_type" DROP CONSTRAINT "FK_fb92795cf33d418cb4a07772a38"`);
        await queryRunner.query(`ALTER TABLE "activity_route" ADD "stars" integer`);
        await queryRunner.query(`ALTER TABLE "activity_route" ADD "grade" double precision`);
        await queryRunner.query(`ALTER TABLE "activity_route" ADD "difficulty" character varying`);
        await queryRunner.query(`ALTER TABLE "activity_route" ADD "name" character varying`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e41703030af5829df36af0eaa5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb92795cf33d418cb4a07772a3"`);
        await queryRunner.query(`DROP TABLE "grading_system_route_type"`);
    }

}
