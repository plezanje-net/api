import { MigrationInterface, QueryRunner } from 'typeorm';
import sharp from 'sharp';
import { env } from 'process';

export class addColumnsToImage1650023444281 implements MigrationInterface {
  name = 'addColumnsToImage1650023444281';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Doing migration');

    await queryRunner.query(
      `ALTER TABLE "image" ADD "aspectRatio" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD "maxIntrinsicWidth" integer`,
    );

    // Sharp does not read bmps. This is one single case of bmp, which was manualy transformed to gif and uploaded to storage on the server
    await queryRunner.query(
      `UPDATE image SET extension = 'gif' WHERE path = 'routes/stajerska-rinka-severna-stena-spominska-bregarjeva-smer' AND extension = 'bmp'`,
    );

    const images = await queryRunner.query(`SELECT * FROM image`);

    for (const image of images) {
      const imagePath = `${env.STORAGE_PATH}/images/${image.path}.${image.extension}`;

      const shImage = sharp(imagePath);
      const { width, height } = await shImage.metadata();
      await queryRunner.query(
        `UPDATE image SET "maxIntrinsicWidth" = ${width}, "aspectRatio" = ${width /
          height} WHERE id = '${image.id}'`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "image" ALTER COLUMN "aspectRatio" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ALTER COLUMN "maxIntrinsicWidth" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" DROP COLUMN "maxIntrinsicWidth"`,
    );
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "aspectRatio"`);
  }
}
