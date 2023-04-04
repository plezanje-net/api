CREATE OR REPLACE FUNCTION public.convert_first_repeat_to_redpoint()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
        DECLARE
            ardate timestamp;
        BEGIN

            -- if deleted was a 'real' tick then convert first repeat to redpoint and possibly toprope repeat to toprope redpoint
            IF  OLD.ascent_type = 'redpoint' OR OLD.ascent_type = 'flash' OR OLD.ascent_type = 'onsight' THEN

                -- find first repeat by same user for same route and convert it to redpoint if such log exists
                UPDATE activity_route
                SET ascent_type = 'redpoint'
                WHERE id = (
                    SELECT id FROM activity_route
                    WHERE route_id = OLD.route_id
                    AND user_id = OLD.user_id
                    AND ascent_type = 'repeat'
                    ORDER BY date
                    LIMIT 1)
                RETURNING date INTO ardate;

                -- find first toprope repeat and if it is logged before the new redpoint ascent convert it to toprope redpoint
                -- that is: Find first TR Repeat and convert it to TR Redpoint, but only if: TR Repeat is before new Redpoint OR new Redpoint does not exist
                UPDATE activity_route
                SET ascent_type = 't_redpoint'
                WHERE id =(
                    SELECT id FROM activity_route
                    WHERE route_id = OLD.route_id
                    AND user_id = OLD.user_id
                    AND (ardate IS NULL OR date < ardate)  -- if above update did nothing skip this condition
                    AND ascent_type = 't_repeat'
                    ORDER BY date
                    LIMIT 1
                    );

            -- if deleted was a toprope tick then convert first toprope repeat to toprope redpoint but only if no real tick is in between
            ELSEIF OLD.ascent_type = 't_redpoint' OR OLD.ascent_type = 't_flash' OR OLD.ascent_type = 't_onsight' THEN

                -- find first real tick (if it exists) and save the time
                SELECT date INTO ardate
                FROM activity_route
                WHERE route_id = OLD.route_id
                AND user_id = OLD.user_id
                AND (ascent_type = 'redpoint' OR ascent_type = 'flash' OR ascent_type = 'onsight')
                ORDER BY date
                LIMIT 1;

                -- convert first toprope repeat that might be logged before the possible real tick log to toprope redpoint
                UPDATE activity_route
                SET ascent_type = 't_redpoint'
                WHERE id = (
                    SELECT id FROM activity_route
                    WHERE route_id = OLD.route_id
                    AND user_id = OLD.user_id
                    AND ascent_type = 't_repeat'
                    AND (ardate IS NULL OR date < ardate)
                    ORDER BY date
                    LIMIT 1
                    );
            END IF;

            RETURN NULL;
        END
        $function$
;

CREATE OR REPLACE FUNCTION public.delete_difficulty_vote()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
          DECLARE
              numTicksLeft INTEGER;
          BEGIN            
              -- see if user has any ticks of this route left
              SELECT count(*) INTO numTicksLeft FROM activity_route
              WHERE route_id = OLD.route_id
              AND user_id = OLD.user_id
              AND ascent_type IN ('redpoint', 'flash', 'onsight', 'repeat');
  
              -- if this was not the last tick, no need to do anything
              IF (numTicksLeft > 0) THEN
                  RETURN NULL;
              END IF;
  
              -- delete users difficulty vote for this route
              DELETE FROM difficulty_vote
              WHERE user_id = OLD.user_id
              AND route_id = OLD.route_id;
  
              RETURN NULL;
          END
          $function$
;

CREATE OR REPLACE FUNCTION public.min_max_route_difficulty_of_crag()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
            DECLARE
                mindiff integer;
                maxdiff integer;
            BEGIN
                -- get min and max difficulty of all routes for the crag to which a route that has been added/deleted/modified belongs to
                SELECT INTO mindiff, maxdiff
                    min(r.difficulty), max(r.difficulty)
                FROM route r
                WHERE crag_id = COALESCE(NEW.crag_id, OLD.crag_id);

                UPDATE crag
                SET min_difficulty = mindiff,
                    max_difficulty = maxdiff
                WHERE id = COALESCE(NEW.crag_id, OLD.crag_id);

                RETURN NEW;
            END
            $function$
;

CREATE OR REPLACE FUNCTION public.recalculate_route_difficulty()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
        $function$
;

CREATE OR REPLACE FUNCTION public.recount_routes_of_crag()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
        DECLARE
            numroutes integer;
        BEGIN
            -- get number of routes for the crag whose route is being inserted or deleted
            SELECT COUNT (*) INTO numroutes
            FROM crag c
            LEFT JOIN route r ON c.id = r.crag_id
            WHERE c.id = COALESCE(NEW.crag_id, OLD.crag_id);
        
            UPDATE crag
            SET nr_routes = numroutes
            WHERE id = COALESCE(NEW.crag_id, OLD.crag_id);
        
            RETURN NEW;
        END
        $function$
;


create trigger convert_first_repeat_to_redpoint after
delete
    on
    public.activity_route for each row execute function convert_first_repeat_to_redpoint();
create trigger delete_difficulty_vote after
delete
    on
    public.activity_route for each row execute function delete_difficulty_vote();

create trigger route_difficulty_vote after
insert
    or
delete
    or
update
    on
    public.difficulty_vote for each row execute function recalculate_route_difficulty();

create trigger crag_min_max_route_difficulty after
insert
    or
delete
    or
update
    on
    public.route for each row execute function min_max_route_difficulty_of_crag();
create trigger crag_route_count after
insert
    or
delete
    on
    public.route for each row execute function recount_routes_of_crag();