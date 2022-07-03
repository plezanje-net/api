import {MigrationInterface, QueryRunner} from "typeorm";

export class cascadeDeleteSectorsOfCrag1656774967083 implements MigrationInterface {
    name = 'cascadeDeleteSectorsOfCrag1656774967083'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sector" DROP CONSTRAINT "FK_3f7e3dea0cbd160c8bbc86ec0e0"`);
        await queryRunner.query(`ALTER TABLE "sector" ADD CONSTRAINT "FK_3f7e3dea0cbd160c8bbc86ec0e0" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sector" DROP CONSTRAINT "FK_3f7e3dea0cbd160c8bbc86ec0e0"`);
        await queryRunner.query(`ALTER TABLE "sector" ADD CONSTRAINT "FK_3f7e3dea0cbd160c8bbc86ec0e0" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
