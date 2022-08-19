import { MigrationInterface, QueryRunner } from 'typeorm';

export class dropStarRatingVoteTrigger1660907261279
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS route_star_rating_vote ON star_rating_vote;`,
    );
    await queryRunner.query(`DROP FUNCTION recalculate_route_star_rating()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Create trigger to recalculate route's star rating every time a star rating vote is cast
    await queryRunner.query(`
        -- recalculates route's star rating from all star rating votes for this route
        CREATE OR REPLACE FUNCTION recalculate_route_star_rating()
            RETURNS TRIGGER
            LANGUAGE PLPGSQL
            AS
        $$
        BEGIN
            UPDATE route
            SET "starRating" = (
                SELECT AVG(stars)
                FROM star_rating_vote
                WHERE "routeId" = COALESCE(NEW."routeId", OLD."routeId")
            )
            WHERE id = COALESCE(NEW."routeId", OLD."routeId");
        
            RETURN NEW;
        END;
        $$;
    `);

    await queryRunner.query(`
        -- adds trigger to recalculate routes star rating when a vote is added, updated or removed
        DROP TRIGGER IF EXISTS route_star_rating_vote ON star_rating_vote;
        CREATE TRIGGER route_star_rating_vote
        AFTER INSERT OR UPDATE OR DELETE
        ON star_rating_vote
        FOR EACH ROW
        EXECUTE PROCEDURE recalculate_route_star_rating();
    `);
  }
}
