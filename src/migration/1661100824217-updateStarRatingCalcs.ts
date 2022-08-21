import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateStarRatingCalcs1661100824217 implements MigrationInterface {
  name = 'updateStarRatingCalcs1661100824217';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP CONSTRAINT "FK_e2996eef518bf566d4a92305101"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP COLUMN "nrStarRatingVotes"`,
    );
    await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "starRating"`);
    await queryRunner.query(`ALTER TABLE "route" ADD "starRating" integer`);

    const starRatingVotesByRoutesCounts = await queryRunner.query(`SELECT s."routeId", count(s.stars) FROM star_rating_vote s
    GROUP BY (s."routeId")`);

    for (const count of starRatingVotesByRoutesCounts) {
      await this.recalculateStarRating(count.routeId, queryRunner);
    }

    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD CONSTRAINT "FK_e2996eef518bf566d4a92305101" FOREIGN KEY ("activityId") REFERENCES "activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP CONSTRAINT "FK_e2996eef518bf566d4a92305101"`,
    );
    await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "starRating"`);
    await queryRunner.query(
      `ALTER TABLE "route" ADD "starRating" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD "nrStarRatingVotes" integer DEFAULT '0'`,
    );

    // set counts and average stars for all routes with existing starRating votes
    const countsAndAverages = await queryRunner.query(`SELECT s."routeId", count(s.stars), avg(s.stars) FROM star_rating_vote s
    GROUP BY (s."routeId")`);

    for (const countAndAverage of countsAndAverages) {
      await queryRunner.query(
        `UPDATE route SET "nrStarRatingVotes" = ${countAndAverage.count}, "starRating" = ${countAndAverage.avg} WHERE id = '${countAndAverage.routeId}'`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD CONSTRAINT "FK_e2996eef518bf566d4a92305101" FOREIGN KEY ("activityId") REFERENCES "activity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  private async recalculateStarRating(
    routeId: string,
    queryRunner: QueryRunner,
  ) {
    const minNumOfVotes = 5;
    const majorityThreshold = 0.5;

    const starRatingVoteCounts = await queryRunner.query(
      `SELECT count(srv.stars) as count, srv.stars as stars FROM star_rating_vote srv where srv."routeId" = '${routeId}' GROUP BY (srv.stars)`,
    );

    let nrAllVotes = 0; // the number of all star rating votes for the route
    let starsSum = 0; // sum of values of all stars (used to calculate the average)
    let mostVotedStar = null; // kind of star that received the most votes. 0, 1 or 2
    let nrVotesForMostVotedStar = 0; // how many votes do we have for the most voted star

    for (const voteCount of starRatingVoteCounts) {
      nrAllVotes += +voteCount['count'];
      starsSum += +voteCount['stars'] * +voteCount['count'];

      if (
        mostVotedStar == null ||
        +voteCount['count'] > nrVotesForMostVotedStar
      ) {
        nrVotesForMostVotedStar = +voteCount['count'];
        mostVotedStar = +voteCount['stars'];
      }
    }

    let starRating = mostVotedStar;
    if (
      nrAllVotes < minNumOfVotes ||
      nrVotesForMostVotedStar / nrAllVotes < majorityThreshold ||
      Math.round(starsSum / nrAllVotes) != mostVotedStar
    ) {
      starRating = null;
    }

    await queryRunner.query(
      `UPDATE route SET "starRating" = ${starRating} WHERE id = '${routeId}'`,
    );
  }
}
