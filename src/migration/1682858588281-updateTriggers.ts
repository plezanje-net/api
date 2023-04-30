import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateTriggers1682858588281 implements MigrationInterface {
  name = 'updateTriggers1682858588281';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create function min_max_route_difficulty_of_crag() returns trigger
        language plpgsql
    as
    $$
                DECLARE
                    mindiff integer;
                    maxdiff integer;
                BEGIN
                    -- get min and max difficulty of all routes for the crag to which a route that has been added/deleted/modified belongs to
                    SELECT INTO mindiff, maxdiff
                        min(r.difficulty), max(r.difficulty)
                    FROM route r
                    WHERE "crag_id" = COALESCE(NEW."crag_id", OLD."crag_id");
    
                    UPDATE crag
                    SET "min_difficulty" = mindiff,
                        "max_difficulty" = maxdiff
                    WHERE id = COALESCE(NEW."crag_id", OLD."crag_id");
    
                    RETURN NEW;
                END
                $$;

                create function recount_routes_of_crag() returns trigger
    language plpgsql
as
$$
        DECLARE
            numroutes integer;
        BEGIN
            -- get number of routes for the crag whose route is being inserted or deleted
            SELECT COUNT (*) INTO numroutes
            FROM crag c
            LEFT JOIN route r ON c.id = r."crag_id"
            WHERE c.id = COALESCE(NEW."crag_id", OLD."crag_id");
        
            UPDATE crag
            SET "nr_routes" = numroutes
            WHERE id = COALESCE(NEW."crag_id", OLD."crag_id");
        
            RETURN NEW;
        END
        $$;

        create function min_max_route_difficulty_of_crag() returns trigger
    language plpgsql
as
$$
            DECLARE
                mindiff integer;
                maxdiff integer;
            BEGIN
                -- get min and max difficulty of all routes for the crag to which a route that has been added/deleted/modified belongs to
                SELECT INTO mindiff, maxdiff
                    min(r.difficulty), max(r.difficulty)
                FROM route r
                WHERE "crag_id" = COALESCE(NEW."crag_id", OLD."crag_id");

                UPDATE crag
                SET "min_difficulty" = mindiff,
                    "max_difficulty" = maxdiff
                WHERE id = COALESCE(NEW."crag_id", OLD."crag_id");

                RETURN NEW;
            END
            $$;

            create function delete_difficulty_vote() returns trigger
    language plpgsql
as
$$
          DECLARE
              numTicksLeft INTEGER;
          BEGIN            
              -- see if user has any ticks of this route left
              SELECT count(*) INTO numTicksLeft FROM activity_route
              WHERE "route_id" = OLD."route_id"
              AND "user_id" = OLD."user_id"
              AND "ascent_type" IN ('redpoint', 'flash', 'onsight', 'repeat');
  
              -- if this was not the last tick, no need to do anything
              IF (numTicksLeft > 0) THEN
                  RETURN NULL;
              END IF;
  
              -- delete users difficulty vote for this route
              DELETE FROM difficulty_vote
              WHERE "user_id" = OLD."user_id"
              AND "route_id" = OLD."route_id";
  
              RETURN NULL;
          END
          $$;

          create function convert_first_repeat_to_redpoint() returns trigger
    language plpgsql
as
$$
        DECLARE
            ardate timestamp;
        BEGIN

            -- if deleted was a 'real' tick then convert first repeat to redpoint and possibly toprope repeat to toprope redpoint
            IF  OLD."ascent_type" = 'redpoint' OR OLD."ascent_type" = 'flash' OR OLD."ascent_type" = 'onsight' THEN

                -- find first repeat by same user for same route and convert it to redpoint if such log exists
                UPDATE activity_route
                SET "ascent_type" = 'redpoint'
                WHERE id = (
                    SELECT id FROM activity_route
                    WHERE "route_id" = OLD."route_id"
                    AND "user_id" = OLD."user_id"
                    AND "ascent_type" = 'repeat'
                    ORDER BY date
                    LIMIT 1)
                RETURNING date INTO ardate;

                -- find first toprope repeat and if it is logged before the new redpoint ascent convert it to toprope redpoint
                -- that is: Find first TR Repeat and convert it to TR Redpoint, but only if: TR Repeat is before new Redpoint OR new Redpoint does not exist
                UPDATE activity_route
                SET "ascent_type" = 't_redpoint'
                WHERE id =(
                    SELECT id FROM activity_route
                    WHERE "route_id" = OLD."route_id"
                    AND "user_id" = OLD."user_id"
                    AND (ardate IS NULL OR date < ardate)  -- if above update did nothing skip this condition
                    AND "ascent_type" = 't_repeat'
                    ORDER BY date
                    LIMIT 1
                    );

            -- if deleted was a toprope tick then convert first toprope repeat to toprope redpoint but only if no real tick is in between
            ELSEIF OLD."ascent_type" = 't_redpoint' OR OLD."ascent_type" = 't_flash' OR OLD."ascent_type" = 't_onsight' THEN

                -- find first real tick (if it exists) and save the time
                SELECT date INTO ardate
                FROM activity_route
                WHERE "route_id" = OLD."route_id"
                AND "user_id" = OLD."user_id"
                AND ("ascent_type" = 'redpoint' OR "ascent_type" = 'flash' OR "ascent_type" = 'onsight')
                ORDER BY date
                LIMIT 1;

                -- convert first toprope repeat that might be logged before the possible real tick log to toprope redpoint
                UPDATE activity_route
                SET "ascent_type" = 't_redpoint'
                WHERE id = (
                    SELECT id FROM activity_route
                    WHERE "route_id" = OLD."route_id"
                    AND "user_id" = OLD."user_id"
                    AND "ascent_type" = 't_repeat'
                    AND (ardate IS NULL OR date < ardate)
                    ORDER BY date
                    LIMIT 1
                    );
            END IF;

            RETURN NULL;
        END
        $$;
        
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // no auto way back for triggers...
  }
}
