import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNumOfStarRatingVotes1662489384682
  implements MigrationInterface
{
  name = 'addNumOfStarRatingVotes1662489384682';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "route" ADD "nrStarRatingVotes" integer DEFAULT '0'`,
    );

    // set counts for all routes with existing starRating votes
    const counts =
      await queryRunner.query(`SELECT s."routeId", count(s.stars) FROM star_rating_vote s
    GROUP BY (s."routeId")`);

    for (const count of counts) {
      await queryRunner.query(
        `UPDATE route SET "nrStarRatingVotes" = ${count.count} WHERE id = '${count.routeId}'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "route" DROP COLUMN "nrStarRatingVotes"`,
    );
  }
}
