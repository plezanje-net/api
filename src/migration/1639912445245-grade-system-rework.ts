import { MigrationInterface, QueryRunner } from "typeorm";

export class gradeSystemRework1639912445245 implements MigrationInterface {
    name = 'gradeSystemRework1639912445245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE "grade"`);
        await queryRunner.query(`ALTER TABLE "grade" DROP CONSTRAINT "FK_98de1cfd884855b655de18974ea"`);
        await queryRunner.query(`ALTER TABLE "grade" DROP CONSTRAINT "FK_8bb7e985f57c47948850542f9d6"`);
        await queryRunner.query(`CREATE TABLE "difficulty_vote" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "difficulty" double precision NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), "legacy" character varying, "isBase" boolean, "userId" uuid, "routeId" uuid, CONSTRAINT "PK_fbc2f237b693f2b412b0e0a5d9f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "route_type" ("id" character varying NOT NULL, "name" character varying NOT NULL, "position" integer NOT NULL, CONSTRAINT "PK_53f16a5d49e1add09bef1b8e270" PRIMARY KEY ("id"))`);

        await queryRunner.query(`INSERT INTO "route_type" (id, name, position) VALUES ('sport','sport',1), ('multipitch','multipitch',2),('boulder','boulder',3),('alpine','alpine',4),('combined','combined',5)`);

        await queryRunner.query(`CREATE TABLE "grading_system" ("id" character varying NOT NULL, "name" character varying NOT NULL, "position" integer NOT NULL, CONSTRAINT "PK_fabfafe0163eb97e17581c6b8b5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "route_type_grading_system" ("routeTypeId" character varying NOT NULL, "gradingSystemId" character varying NOT NULL, CONSTRAINT "PK_58dbc4abf8b467c7470cdbff052" PRIMARY KEY ("routeTypeId", "gradingSystemId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_876495711515bf4f3b34f8172f" ON "route_type_grading_system" ("routeTypeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_874ecc4fd3a131710ddc26558a" ON "route_type_grading_system" ("gradingSystemId") `);
        await queryRunner.query(`ALTER TABLE "grade" DROP COLUMN "grade"`);
        await queryRunner.query(`ALTER TABLE "grade" DROP COLUMN "created"`);
        await queryRunner.query(`ALTER TABLE "grade" DROP COLUMN "updated"`);
        await queryRunner.query(`ALTER TABLE "grade" DROP COLUMN "legacy"`);
        await queryRunner.query(`ALTER TABLE "grade" DROP COLUMN "isBase"`);
        await queryRunner.query(`ALTER TABLE "grade" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "grade" DROP COLUMN "routeId"`);

        await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "grade"`);
        await queryRunner.query(`ALTER TABLE "grade" ADD "difficulty" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grade" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grade" ADD "gradingSystemId" character varying`);
        await queryRunner.query(`ALTER TABLE "route" ADD "routeTypeId" character varying`);

        await queryRunner.query(`UPDATE "route" SET "routeTypeId" = "type"`);

        await queryRunner.query(`ALTER TABLE "route" ALTER COLUMN "routeTypeId" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."route_type_enum"`);

        await queryRunner.query(`ALTER TABLE "route" ADD "isProject" boolean NOT NULL DEFAULT false`);

        await queryRunner.query(`ALTER TABLE "route" ADD "defaultGradingSystemId" character varying`);
        await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "difficulty"`);
        await queryRunner.query(`ALTER TABLE "route" ADD "difficulty" double precision`);
        await queryRunner.query(`ALTER TABLE "difficulty_vote" ADD CONSTRAINT "FK_36cae28a50bf55b91a15d25e90d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "difficulty_vote" ADD CONSTRAINT "FK_42c68e444fd3ec48f66854897e9" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grade" ADD CONSTRAINT "FK_fffa16e913eaf483cb7e776dc08" FOREIGN KEY ("gradingSystemId") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "route" ADD CONSTRAINT "FK_45f1dd3d8849f393f429935beeb" FOREIGN KEY ("routeTypeId") REFERENCES "route_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "route" ADD CONSTRAINT "FK_8720c83b6fdffcead06dd220703" FOREIGN KEY ("defaultGradingSystemId") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "route_type_grading_system" ADD CONSTRAINT "FK_876495711515bf4f3b34f8172fb" FOREIGN KEY ("routeTypeId") REFERENCES "route_type"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "route_type_grading_system" ADD CONSTRAINT "FK_874ecc4fd3a131710ddc26558a3" FOREIGN KEY ("gradingSystemId") REFERENCES "grading_system"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "route_type_grading_system" DROP CONSTRAINT "FK_874ecc4fd3a131710ddc26558a3"`);
        await queryRunner.query(`ALTER TABLE "route_type_grading_system" DROP CONSTRAINT "FK_876495711515bf4f3b34f8172fb"`);
        await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "FK_8720c83b6fdffcead06dd220703"`);
        await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "FK_45f1dd3d8849f393f429935beeb"`);
        await queryRunner.query(`ALTER TABLE "grade" DROP CONSTRAINT "FK_fffa16e913eaf483cb7e776dc08"`);
        await queryRunner.query(`ALTER TABLE "difficulty_vote" DROP CONSTRAINT "FK_42c68e444fd3ec48f66854897e9"`);
        await queryRunner.query(`ALTER TABLE "difficulty_vote" DROP CONSTRAINT "FK_36cae28a50bf55b91a15d25e90d"`);
        await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "difficulty"`);
        await queryRunner.query(`ALTER TABLE "route" ADD "difficulty" character varying`);
        await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "defaultGradingSystemId"`);
        await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "isProject"`);
        await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "routeTypeId"`);
        await queryRunner.query(`ALTER TABLE "grade" DROP COLUMN "gradingSystemId"`);
        await queryRunner.query(`ALTER TABLE "grade" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "grade" DROP COLUMN "difficulty"`);
        await queryRunner.query(`ALTER TABLE "route" ADD "grade" double precision`);
        await queryRunner.query(`CREATE TYPE "public"."route_type_enum" AS ENUM('sport', 'multipitch', 'boulder', 'alpine', 'indoor', 'combined')`);
        await queryRunner.query(`ALTER TABLE "route" ADD "type" "public"."route_type_enum" NOT NULL DEFAULT 'sport'`);
        await queryRunner.query(`ALTER TABLE "grade" ADD "routeId" uuid`);
        await queryRunner.query(`ALTER TABLE "grade" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "grade" ADD "isBase" boolean`);
        await queryRunner.query(`ALTER TABLE "grade" ADD "legacy" character varying`);
        await queryRunner.query(`ALTER TABLE "grade" ADD "updated" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "grade" ADD "created" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "grade" ADD "grade" double precision NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_874ecc4fd3a131710ddc26558a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_876495711515bf4f3b34f8172f"`);
        await queryRunner.query(`DROP TABLE "route_type_grading_system"`);
        await queryRunner.query(`DROP TABLE "grading_system"`);
        await queryRunner.query(`DROP TABLE "route_type"`);
        await queryRunner.query(`DROP TABLE "difficulty_vote"`);
        await queryRunner.query(`ALTER TABLE "grade" ADD CONSTRAINT "FK_8bb7e985f57c47948850542f9d6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grade" ADD CONSTRAINT "FK_98de1cfd884855b655de18974ea" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
