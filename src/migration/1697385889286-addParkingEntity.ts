import { MigrationInterface, QueryRunner } from "typeorm";

export class addParkingEntity1697385889286 implements MigrationInterface {
    name = 'addParkingEntity1697385889286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "parking" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lat" double precision NOT NULL, "lon" double precision NOT NULL, CONSTRAINT "PK_d611d86b1d39963d048b05976aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sector_parkings_parking" ("sector_id" uuid NOT NULL, "parking_id" uuid NOT NULL, CONSTRAINT "PK_9542e684019edec4d8f4783993d" PRIMARY KEY ("sector_id", "parking_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_02ab9a0fee51cb95b32b602190" ON "sector_parkings_parking" ("sector_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b115f5dc591dea45f4bb9c7f07" ON "sector_parkings_parking" ("parking_id") `);
        await queryRunner.query(`ALTER TABLE "sector_parkings_parking" ADD CONSTRAINT "FK_02ab9a0fee51cb95b32b6021904" FOREIGN KEY ("sector_id") REFERENCES "sector"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "sector_parkings_parking" ADD CONSTRAINT "FK_b115f5dc591dea45f4bb9c7f070" FOREIGN KEY ("parking_id") REFERENCES "parking"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sector_parkings_parking" DROP CONSTRAINT "FK_b115f5dc591dea45f4bb9c7f070"`);
        await queryRunner.query(`ALTER TABLE "sector_parkings_parking" DROP CONSTRAINT "FK_02ab9a0fee51cb95b32b6021904"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b115f5dc591dea45f4bb9c7f07"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_02ab9a0fee51cb95b32b602190"`);
        await queryRunner.query(`DROP TABLE "sector_parkings_parking"`);
        await queryRunner.query(`DROP TABLE "parking"`);
    }

}
