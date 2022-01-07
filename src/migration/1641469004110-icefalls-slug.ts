import { MigrationInterface, QueryRunner } from 'typeorm';

export class icefallsSlug1641469004110 implements MigrationInterface {
  name = 'icefallsSlug1641469004110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD "slug" character varying`,
    );

    await queryRunner.query(
      `update "ice_fall" set slug = btrim(regexp_replace(regexp_replace(unaccent(lower(name)), '[\''\(\)\ \,\.\+\#\?\!\`]', '-', 'g'), '-+', '-', 'g'), '-')`,
    );

    let n = 1;

    while (await this.hasDupes(queryRunner)) {
      await queryRunner.query(`
                    update "ice_fall" set slug = concat(slug, '-${n}') 
                    where id in (
                        select cast(min(cast(id as varchar)) as uuid) as id from "ice_fall" group by slug having count(id) > 1
                    )
                `);
      n++;

      if (n > 100) break;
    }

    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD CONSTRAINT "UQ_c4ce54faaf24cddbfa70c5eeee6" UNIQUE ("slug")`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ALTER COLUMN "slug" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ice_fall" DROP COLUMN "slug"`);
  }

  private async hasDupes(queryRunner: QueryRunner): Promise<boolean> {
    const result = await queryRunner.query(
      `select min(cast(id as varchar)) as id, slug, count(id) from "ice_fall" group by slug having count(id) > 1`,
    );

    return Promise.resolve(result.length > 0);
  }
}
