import { MigrationInterface, QueryRunner } from "typeorm";

export class cascadeDeleteCragPropertyFK1679818310991 implements MigrationInterface {
    name = 'cascadeDeleteCragPropertyFK1679818310991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crag_property" DROP CONSTRAINT "FK_66aa9b1be26f87337745c8c82ef"`);
        await queryRunner.query(`ALTER TABLE "crag_property" ADD CONSTRAINT "FK_66aa9b1be26f87337745c8c82ef" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crag_property" DROP CONSTRAINT "FK_66aa9b1be26f87337745c8c82ef"`);
        await queryRunner.query(`ALTER TABLE "crag_property" ADD CONSTRAINT "FK_66aa9b1be26f87337745c8c82ef" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
