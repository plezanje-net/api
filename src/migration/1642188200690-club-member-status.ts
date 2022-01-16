import { MigrationInterface, QueryRunner } from 'typeorm';

export class clubMemberStatus1642188200690 implements MigrationInterface {
  name = 'clubMemberStatus1642188200690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "club_member" ADD "confirmationToken" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."club_member_status_enum" AS ENUM('pending', 'active')`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_member" ADD "status" "public"."club_member_status_enum" NOT NULL DEFAULT 'pending'`,
    );

    // assuming all club members currently in db have somehow already confirmed their memberships
    await queryRunner.query(`UPDATE club_member SET status = 'active'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "club_member" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."club_member_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "club_member" DROP COLUMN "confirmationToken"`,
    );
  }
}
