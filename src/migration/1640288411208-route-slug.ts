import { MigrationInterface, QueryRunner } from 'typeorm';

export class routeSlug1640288411208 implements MigrationInterface {
  name = 'routeSlug1640288411208';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "route" ADD "slug" character varying`);

    await queryRunner.query(
      `update route set slug = btrim(regexp_replace(regexp_replace(unaccent(lower(name)), '[\''\(\)\ \,\.\+\#\?\!\`]', '-', 'g'), '-+', '-', 'g'), '-')`,
    );

    let n = 1;

    while (await this.hasDupes(queryRunner)) {
      await queryRunner.query(`
            update route set slug = concat(slug, '-${n}') 
            where id in (
                select cast(min(cast(id as varchar)) as uuid) as id from route group by slug, "cragId" having count(id) > 1
            )
        `);
      n++;

      if (n > 100) break;
    }

    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "UQ_dfed6177fa5752c50fafce148f7" UNIQUE ("slug", "cragId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "UQ_dfed6177fa5752c50fafce148f7"`,
    );
    await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "slug"`);
  }

  private async hasDupes(queryRunner: QueryRunner): Promise<boolean> {
    const result = await queryRunner.query(
      `select min(cast(id as varchar)) as id, slug, "cragId", count(id) from route group by slug, "cragId" having count(id) > 1`,
    );

    return Promise.resolve(result.length > 0);
  }
}
