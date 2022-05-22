import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserFieldToEntities1652891749427 implements MigrationInterface {
  name = 'addUserFieldToEntities1652891749427';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "crag" ADD "userId" uuid`);
    await queryRunner.query(`ALTER TABLE "sector" ADD "userId" uuid`);
    await queryRunner.query(`ALTER TABLE "pitch" ADD "userId" uuid`);
    await queryRunner.query(`ALTER TABLE "route" ADD "userId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "crag" ADD CONSTRAINT "FK_c6dc3cd25d927e6aaea2a9a490b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" ADD CONSTRAINT "FK_ed74ef0d9d6fd57eb480d8b6b86" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" ADD CONSTRAINT "FK_8da47bd5a6c860045fa53911b68" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_5f1f8af943496a71fa29f6a44f9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    //update routes and crags with their appropriate editors
    await queryRunner.query(`
      update crag as c set "userId" = u.id from "user" u where u.legacy::jsonb -> 'UserID' = c.legacy::jsonb -> 'Editor'
    `);
    await queryRunner.query(`
      update route as r set "userId" = u.id from "user" u where u.legacy::jsonb -> 'UserID' = r.legacy::jsonb -> 'Editor'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_5f1f8af943496a71fa29f6a44f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" DROP CONSTRAINT "FK_8da47bd5a6c860045fa53911b68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" DROP CONSTRAINT "FK_ed74ef0d9d6fd57eb480d8b6b86"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" DROP CONSTRAINT "FK_c6dc3cd25d927e6aaea2a9a490b"`,
    );
    await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "pitch" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "sector" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "crag" DROP COLUMN "userId"`);
  }
}
