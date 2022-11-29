import { MigrationInterface, QueryRunner } from 'typeorm';

export class removePictureAddProfileImageToUser1665753973994
  implements MigrationInterface
{
  name = 'removePictureAddProfileImageToUser1665753973994';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "picture"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "profileImageId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_5c0981de5dc2a2222a1f0574859" UNIQUE ("profileImageId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_5c0981de5dc2a2222a1f0574859" FOREIGN KEY ("profileImageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Link all images with 'old' type of profile to users of the same image
    const profileImages = await queryRunner.query(
      `SELECT * FROM "image" i WHERE i."type"='profile'`,
    );
    for (const image of profileImages) {
      await queryRunner.query(
        `UPDATE "user" SET "profileImageId" = '${image.id}' WHERE id = '${image.userId}'`,
      );
    }

    // We have two special cases which we will address manually
    // These two user had more than one profile image (matched from currently used on old pnet).
    await queryRunner.query(
      `UPDATE "user" SET "profileImageId" = 'c90bbff0-a973-4166-ae6d-306b7bc5f5f3' WHERE id = 'b88e337a-ebab-4116-a0f7-3491c0607cc2'`,
    );
    await queryRunner.query(
      `UPDATE "user" SET "profileImageId" = '69f6449b-270a-4dee-bd26-f9a4c71cfb0c' WHERE id = '893a32fe-fc96-4585-a88e-2f12790a0c97'`,
    );

    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."image_type_enum"`);

    await queryRunner.query(
      `ALTER TABLE "image" ADD "author" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."image_type_enum" AS ENUM('photo', 'sketch', 'map', 'profile')`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD "type" "public"."image_type_enum" NOT NULL DEFAULT 'photo'`,
    );

    // Link all images with 'old' type of profile to users of the same image
    const usersWithProfileImages = await queryRunner.query(
      `SELECT * FROM "user" u WHERE u."profileImageId" IS NOT NULL`,
    );
    for (const user of usersWithProfileImages) {
      await queryRunner.query(
        `UPDATE "image" SET "type" = 'profile' WHERE id = '${user.profileImageId}'`,
      );
    }
    console.error(
      `Data in column 'type' of table 'image' is only partly reconstructed.`,
    );

    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_5c0981de5dc2a2222a1f0574859"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_5c0981de5dc2a2222a1f0574859"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profileImageId"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "profileImageId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "profileImageId" TO "picture"`,
    );

    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "author"`);
  }
}
