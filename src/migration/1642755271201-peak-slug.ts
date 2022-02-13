import { MigrationInterface, QueryRunner } from 'typeorm';

export class peakSlug1642755271201 implements MigrationInterface {
  name = 'peakSlug1642755271201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "peak" ADD "slug" character varying`);

    await queryRunner.query(
      `update "peak" set slug = btrim(regexp_replace(regexp_replace(unaccent(lower(name)), '[\''\(\)\ \,\.\+\#\?\!\`]', '-', 'g'), '-+', '-', 'g'), '-')`,
    );

    // generate slugs
    let n = 1;
    while (await this.hasDupes(queryRunner)) {
      await queryRunner.query(
        `update "peak" set slug = concat(slug, '-${n}') 
            where id in (
                select cast(min(cast(id as varchar)) as uuid) as id
                from "peak"
                group by slug
                having count(id) > 1
            )`,
      );
      n++;
      if (n > 100) break;
    }

    // now that the slug field is filled add constraints to it
    await queryRunner.query(
      `ALTER TABLE "peak" ALTER COLUMN "slug" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" ADD CONSTRAINT "UQ_15256db7b2cdee831a8a5dd52ba" UNIQUE ("slug")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "peak" DROP COLUMN "slug"`);
  }

  private async hasDupes(queryRunner: QueryRunner): Promise<boolean> {
    const result = await queryRunner.query(
      `select min(cast(id as varchar)) as id, slug, count(id) from "peak" group by slug having count(id) > 1`,
    );

    return Promise.resolve(result.length > 0);
  }
}
