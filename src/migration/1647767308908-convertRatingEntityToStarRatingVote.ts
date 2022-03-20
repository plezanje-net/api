import { MigrationInterface, QueryRunner } from 'typeorm';

export class convertRatingEntityToStarRatingVote1647767308908
  implements MigrationInterface {
  name = 'convertRatingEntityToStarRatingVote1647767308908';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create new table with more suitable name
    await queryRunner.query(
      `CREATE TABLE "star_rating_vote" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stars" integer NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "routeId" uuid, CONSTRAINT "PK_4752d18faaa38cf237fcfaa9843" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" ADD CONSTRAINT "FK_8e9d40091ce33caabaf43da8950" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" ADD CONSTRAINT "FK_59cdf2bf94368127c5f8b6096ee" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Drop old table named rating
    await queryRunner.query(`DROP TABLE "rating"`);

    // Modify trigger function, that used the old table
    // Also rename this function, so actually drop the old one, create new one, then also drop and recreate the trigger
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS delete_difficulty_and_beauty_vote ON activity_route;`,
    );

    await queryRunner.query(
      `DROP FUNCTION delete_difficulty_and_beauty_vote();`,
    );

    await queryRunner.query(`
        -- if deleted was the only tick of a route then automatically delete users difficulty vote for this route and users beauty (star rating) vote for this route

        CREATE OR REPLACE FUNCTION delete_difficulty_and_star_rating_votes()
            RETURNS TRIGGER
            LANGUAGE plpgsql
            AS
        $$
        DECLARE
            numTicksLeft INTEGER;
        BEGIN            
            -- see if user has any ticks of this route left
            SELECT count(*) INTO numTicksLeft FROM activity_route
            WHERE "routeId" = OLD."routeId"
            AND "userId" = OLD."userId"
            AND "ascentType" IN ('redpoint', 'flash', 'onsight', 'repeat');

            -- if this was not the last tick, no need to do anything
            IF (numTicksLeft > 0) THEN
                RETURN NULL;
            END IF;

            -- delete users difficulty vote for this route
            DELETE FROM difficulty_vote
            WHERE "userId" = OLD."userId"
            AND "routeId" = OLD."routeId";

            -- delete users star rating (beauty) vote for this route
            DELETE FROM star_rating_vote
            WHERE "userId" = OLD."userId"
            AND "routeId" = OLD."routeId";

            RETURN NULL;
        END
        $$;
    `);

    await queryRunner.query(`        
        DROP TRIGGER IF EXISTS delete_difficulty_and_star_rating_votes ON activity_route;
        CREATE TRIGGER delete_difficulty_and_star_rating_votes
            AFTER DELETE
            ON activity_route
            FOR EACH ROW
            EXECUTE PROCEDURE delete_difficulty_and_star_rating_votes();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" DROP CONSTRAINT "FK_59cdf2bf94368127c5f8b6096ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" DROP CONSTRAINT "FK_8e9d40091ce33caabaf43da8950"`,
    );
    await queryRunner.query(`DROP TABLE "star_rating_vote"`);
  }
}
