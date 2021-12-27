import { Exception } from 'handlebars';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class areasRework1640603902543 implements MigrationInterface {
  name = 'areasRework1640603902543';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."area_type_enum" AS ENUM('region', 'mountains', 'valley', 'area')`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" ADD "type" "public"."area_type_enum" NOT NULL DEFAULT 'area'`,
    );
    await queryRunner.query(`ALTER TABLE "area" ADD "description" text`);
    await queryRunner.query(`ALTER TABLE "area" ADD "areaId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "area" ADD CONSTRAINT "FK_48465cf333cad84a2a3ef535434" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    const result = await queryRunner.query(`SELECT * FROM "area"`);
    result.forEach(async area => {
      const json = JSON.parse(area.legacy);
      const parent = await queryRunner.query(
        `SELECT * FROM "area" WHERE legacy LIKE '%\"AreaID\":${json.ParentID},%'`,
      );
      if (parent.length > 0) {
        await queryRunner.query(
          `UPDATE "area" SET "areaId" = '${parent[0].id}' WHERE id = '${area.id}'`,
        );
      }

      const map = {
        V: 'valley',
        G: 'region',
        M: 'mountains',
        R: 'area',
        S: 'area',
      };

      await queryRunner.query(
        `UPDATE "area" SET "type" = '${
          map[json.AreaType ?? 'G']
        }' WHERE id = '${area.id}'`,
      );
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "area" DROP CONSTRAINT "FK_48465cf333cad84a2a3ef535434"`,
    );
    await queryRunner.query(`ALTER TABLE "area" DROP COLUMN "areaId"`);
    await queryRunner.query(`ALTER TABLE "area" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "area" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."area_type_enum"`);
  }
}
