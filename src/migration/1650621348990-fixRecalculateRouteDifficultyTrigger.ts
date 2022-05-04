import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixRecalculateRouteDifficultyTrigger1650621348990
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update the trigger, so it is not limited to trigger depth anymore
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS route_difficulty_vote ON difficulty_vote;`,
    );
    await queryRunner.query(
      `CREATE TRIGGER route_difficulty_vote
        AFTER INSERT OR UPDATE OR DELETE
        ON difficulty_vote
        FOR EACH ROW
        EXECUTE PROCEDURE recalculate_route_difficulty();`,
    );

    // Update the trigger function so that it disables triggers while executing by which it prevents endless recursive loop
    // Also now a route becomes a project, when last/only vote is deleted
    await queryRunner.query(
      `create or replace function recalculate_route_difficulty() returns trigger
        language plpgsql
        as
        $$
        DECLARE
            numvotes integer;
            calcedDifficulty double precision;
            roundedFifth integer;
        BEGIN

            -- temporarily disable triggers for this session so that we don't get a recursive loop while altering the difficulty_vote table
            SET session_replication_role = replica;

            -- one vote, two votes, more than two votes
            SELECT count(*) INTO numvotes
            FROM difficulty_vote
            WHERE "routeId" = COALESCE(NEW."routeId", OLD."routeId");   -- update and insert pass NEW, update and delete pass OLD

            CASE numvotes
                WHEN 0 THEN
                    -- only vote was apparently just deleted so set difficulty of a route to null
                    calcedDifficulty = null;

                    -- if no vote route has no difficulty, so apparently it is a project
                    UPDATE route
                    SET "isProject" = TRUE
                    WHERE id = COALESCE(NEW."routeId", OLD."routeId");

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

            -- reenable triggers after all is done
            SET session_replication_role = DEFAULT;

            RETURN NEW;
        END;
        $$;`,
    );
  }

  public async down(): Promise<void> {
    return null;
  }
}
