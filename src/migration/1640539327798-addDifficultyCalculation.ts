import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDifficultyCalculation1640539327798
  implements MigrationInterface {
  name = 'addDifficultyCalculation1640539327798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ADD "includedInCalculation" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`
        -- recalculates route's difficulty from all difficulty votes for this route
            CREATE OR REPLACE FUNCTION recalculate_route_difficulty()
            RETURNS TRIGGER
            LANGUAGE PLPGSQL
            AS
            $$
            DECLARE
                numvotes integer;
                calcedDifficulty double precision;
                roundedFifth integer;
            BEGIN

                -- one vote, two votes, more than two votes
                SELECT count(*) INTO numvotes
                FROM difficulty_vote
                WHERE "routeId" = COALESCE(NEW."routeId", OLD."routeId");   -- update and insert pass NEW, update and delete pass OLD

                CASE numvotes
                    WHEN 0 THEN
                        -- only vote was apparently just deleted so set difficulty of a route to null
                        calcedDifficulty = null;

                    WHEN 1, 2 THEN
                        -- only one or two votes, so only the base grade is included in calculation
                        calcedDifficulty =(
                            SELECT difficulty
                            FROM difficulty_vote
                            WHERE "routeId" = COALESCE(NEW."routeId", OLD."routeId") AND "isBase" = true
                        );

                        UPDATE difficulty_vote
                        SET "includedInCalculation" = COALESCE("isBase", false)
                        WHERE "routeId" = COALESCE(NEW."routeId", OLD."routeId");

                    ELSE
                        -- more than 2 votes. skip top and bottom 20% grades, and use all others to get the average

                        -- find out how many lowest and highest grades to skip
                        roundedFifth = ROUND(numvotes::numeric/5);

                        -- set all as not included in calc, then set only ones that should be as included in calc
                        UPDATE difficulty_vote
                        SET "includedInCalculation" = FALSE
                        WHERE "routeId" = COALESCE(NEW."routeId", OLD."routeId");

                        WITH isIncluded AS (
                            SELECT id
                            FROM difficulty_vote
                            where "routeId" = COALESCE(NEW."routeId", OLD."routeId")
                            order by difficulty, id     -- add id to order to keep consistency on many same excluded difficulties
                            offset roundedFifth
                            limit  numvotes - roundedFifth - roundedFifth
                        )
                        UPDATE difficulty_vote dv
                        SET "includedInCalculation" = true
                        FROM isIncluded
                        WHERE dv.id = isIncluded.id;

                        -- calculate difficulty only from 'middle' 3/5 of votes
                        calcedDifficulty =(
                            SELECT AVG(difficulty)
                            FROM difficulty_vote
                            WHERE "routeId" = COALESCE(NEW."routeId", OLD."routeId") AND "includedInCalculation" = true
                        );
                END CASE;

                UPDATE route
                SET difficulty = calcedDifficulty
                WHERE id = COALESCE(NEW."routeId", OLD."routeId");

                RETURN NEW;
            END;
            $$;        
        `);
    await queryRunner.query(`
            -- adds trigger to recalculate routes difficulty when a vote is added, updated or removed
            DROP TRIGGER IF EXISTS route_difficulty_vote ON difficulty_vote;
            CREATE TRIGGER route_difficulty_vote
            AFTER INSERT OR UPDATE OR DELETE
            ON difficulty_vote
            FOR EACH ROW
            WHEN (pg_trigger_depth() = 0)
            EXECUTE PROCEDURE recalculate_route_difficulty();    
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS route_difficulty_vote ON difficulty_vote;`,
    );

    await queryRunner.query(
      `DROP FUNCTION IF EXISTS recalculate_route_difficulty();`,
    );

    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" DROP COLUMN "includedInCalculation"`,
    );
  }
}
