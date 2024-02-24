import slugify from 'slugify';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class areaSlugNonNullable1703958939270 implements MigrationInterface {
  name = 'areaSlugNonNullable1703958939270';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Some areas that were added by users have slugs missing. Add slugs before making slug non-nullable.
    const missingSlugAreas = await queryRunner.query(
      `SELECT a.name, a.id FROM "area" a WHERE a.slug IS NULL`,
    );

    for (let i = 0; i < missingSlugAreas.length; i++) {
      const area = missingSlugAreas[i];
      const slug = await this.generateAreaSlug(area.name, queryRunner);
      await queryRunner.query(
        `UPDATE "area" a SET "slug" = '${slug}' WHERE a.id = '${area.id}'`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "area" ALTER COLUMN "slug" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "area" ALTER COLUMN "slug" DROP NOT NULL`,
    );
  }

  private async generateAreaSlug(areaName: string, queryRunner: QueryRunner) {
    let slug = slugify(areaName, { lower: true });
    let suffixCounter = 0;
    let suffix = '';

    while (
      (
        await queryRunner.query(
          `SELECT * FROM "area" a WHERE a.slug = '${slug}${suffix}'`,
        )
      ).length > 0
    ) {
      suffixCounter++;
      suffix = '-' + suffixCounter;
    }
    slug += suffix;

    return slug;
  }
}
