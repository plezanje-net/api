import { MigrationInterface, QueryRunner } from "typeorm";

export class cascadeNullifyCragActivityFK1679821202524 implements MigrationInterface {
    name = 'cascadeNullifyCragActivityFK1679821202524'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity" DROP CONSTRAINT "FK_626d254ca76bdbb0be1aef6b7c9"`);
        await queryRunner.query(`ALTER TABLE "activity" ADD CONSTRAINT "FK_626d254ca76bdbb0be1aef6b7c9" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity" DROP CONSTRAINT "FK_626d254ca76bdbb0be1aef6b7c9"`);
        await queryRunner.query(`ALTER TABLE "activity" ADD CONSTRAINT "FK_626d254ca76bdbb0be1aef6b7c9" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
