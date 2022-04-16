import {MigrationInterface, QueryRunner} from "typeorm";

export class entityProperties1650092833824 implements MigrationInterface {
    name = 'entityProperties1650092833824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."crag_status_idx"`);
        await queryRunner.query(`CREATE TABLE "property_type" ("id" character varying NOT NULL, "name" character varying NOT NULL, "valueType" character varying NOT NULL, "position" integer NOT NULL, CONSTRAINT "PK_eb483bf7f6ddf612998949edd26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "crag_property" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "propertyTypeId" character varying NOT NULL, "stringValue" character varying, "textValue" text, "numValue" integer, "position" integer NOT NULL, "cragId" uuid NOT NULL, CONSTRAINT "PK_d414146bbed4c0b8020f21e148a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "crag_property" ADD CONSTRAINT "FK_0c46cfe4ccdba50f112025d4bba" FOREIGN KEY ("propertyTypeId") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "crag_property" ADD CONSTRAINT "FK_66aa9b1be26f87337745c8c82ef" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crag_property" DROP CONSTRAINT "FK_66aa9b1be26f87337745c8c82ef"`);
        await queryRunner.query(`ALTER TABLE "crag_property" DROP CONSTRAINT "FK_0c46cfe4ccdba50f112025d4bba"`);
        await queryRunner.query(`DROP TABLE "crag_property"`);
        await queryRunner.query(`DROP TABLE "property_type"`);
        await queryRunner.query(`CREATE INDEX "crag_status_idx" ON "crag" ("status") `);
    }

}
