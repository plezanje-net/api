import { MigrationInterface, QueryRunner } from 'typeorm';

export class areasSlug1640898554714 implements MigrationInterface {
  name = 'areasSlug1640898554714';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "area" ADD "slug" character varying`);

    await queryRunner.query(
      `update "area" set slug = btrim(regexp_replace(regexp_replace(unaccent(lower(name)), '[\''\(\)\ \,\.\+\#\?\!\`]', '-', 'g'), '-+', '-', 'g'), '-')`,
    );

    let n = 1;

    while (await this.hasDupes(queryRunner)) {
      await queryRunner.query(`
                  update "area" set slug = concat(slug, '-${n}') 
                  where id in (
                      select cast(min(cast(id as varchar)) as uuid) as id from "area" group by slug having count(id) > 1
                  )
              `);
      n++;

      if (n > 100) break;
    }

    await queryRunner.query(
      `ALTER TABLE "area" ADD CONSTRAINT "UQ_ad49263b9c3858bd269aa7bbf72" UNIQUE ("slug")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "area" DROP CONSTRAINT "UQ_ad49263b9c3858bd269aa7bbf72"`,
    );
    await queryRunner.query(`ALTER TABLE "area" DROP COLUMN "slug"`);
  }

  private async hasDupes(queryRunner: QueryRunner): Promise<boolean> {
    const result = await queryRunner.query(
      `select min(cast(id as varchar)) as id, slug, count(id) from "area" group by slug having count(id) > 1`,
    );

    return Promise.resolve(result.length > 0);
  }
}
