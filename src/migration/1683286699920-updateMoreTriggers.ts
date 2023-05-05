import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateMoreTriggers1683286699920 implements MigrationInterface {
  name = 'updateMoreTriggers1683286699920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create or replace function recalculate_route_difficulty() returns trigger
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
            WHERE route_id = COALESCE(NEW.route_id, OLD.route_id);   -- update and insert pass NEW, update and delete pass OLD

            CASE numvotes
                WHEN 0 THEN
                    -- only vote was apparently just deleted so set difficulty of a route to null
                    calcedDifficulty = null;

                    -- if no vote route has no difficulty, so apparently it is a project
                    UPDATE route
                    SET is_project = TRUE
                    WHERE id = COALESCE(NEW.route_id, OLD.route_id);

                WHEN 1, 2 THEN
                    -- only one or two votes, so only the base grade is included in calculation
                    calcedDifficulty =(
                        SELECT difficulty
                        FROM difficulty_vote
                        WHERE route_id = COALESCE(NEW.route_id, OLD.route_id) AND is_base = true
                    );

                    UPDATE difficulty_vote
                    SET included_in_calculation = COALESCE(is_base, false)
                    WHERE route_id = COALESCE(NEW.route_id, OLD.route_id);

                ELSE
                    -- more than 2 votes. skip top and bottom 20% grades, and use all others to get the average

                    -- find out how many lowest and highest grades to skip
                    roundedFifth = ROUND(numvotes::numeric/5);

                    -- set all as not included in calc, then set only ones that should be as included in calc
                    UPDATE difficulty_vote
                    SET included_in_calculation = FALSE
                    WHERE route_id = COALESCE(NEW.route_id, OLD.route_id);

                    WITH isIncluded AS (
                        SELECT id
                        FROM difficulty_vote
                        where route_id = COALESCE(NEW.route_id, OLD.route_id)
                        order by difficulty, id     -- add id to order to keep consistency on many same excluded difficulties
                        offset roundedFifth
                        limit  numvotes - roundedFifth - roundedFifth
                    )
                    UPDATE difficulty_vote dv
                    SET included_in_calculation = true
                    FROM isIncluded
                    WHERE dv.id = isIncluded.id;

                    -- calculate difficulty only from 'middle' 3/5 of votes
                    calcedDifficulty =(
                        SELECT AVG(difficulty)
                        FROM difficulty_vote
                        WHERE route_id = COALESCE(NEW.route_id, OLD.route_id) AND included_in_calculation = true
                    );
            END CASE;

            UPDATE route
            SET difficulty = calcedDifficulty
            WHERE id = COALESCE(NEW.route_id, OLD.route_id);

            -- reenable triggers after all is done
            SET session_replication_role = DEFAULT;

            RETURN NEW;
        END;
$$;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create or replace function recalculate_route_difficulty() returns trigger
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
$$;
`);
  }
}
