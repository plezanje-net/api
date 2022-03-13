import {MigrationInterface, QueryRunner} from "typeorm";

export class activityRouteCascade1645447461580 implements MigrationInterface {
    name = 'activityRouteCascade1645447461580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_route" DROP CONSTRAINT "FK_e2996eef518bf566d4a92305101"`);
        await queryRunner.query(`ALTER TABLE "activity_route" ADD CONSTRAINT "FK_e2996eef518bf566d4a92305101" FOREIGN KEY ("activityId") REFERENCES "activity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_route" DROP CONSTRAINT "FK_e2996eef518bf566d4a92305101"`);
        await queryRunner.query(`ALTER TABLE "activity_route" ADD CONSTRAINT "FK_e2996eef518bf566d4a92305101" FOREIGN KEY ("activityId") REFERENCES "activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
