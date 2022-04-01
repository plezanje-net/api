import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixConvertAscentTypesOnLogDeleteTrigger1648797413444
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // correct the trigger function so that it uses the date field of activityRoute instead of the wrong! created field
    await queryRunner.query(`
        -- trigger for auto-converting first repeat after deleted tick into a redpoint if one such repeat exists
        -- should assume that tick (rp, os, f) is first and that repeat can only be after
        -- converts also first toprope repeat to toprope redpoint if one exists in between old and new 'real' tick
        -- also handles deleting toprope 'ticks' by converting toprope repeat to toprope redpoint
        -- expects activity_route row as input
        CREATE OR REPLACE FUNCTION convert_first_repeat_to_redpoint()
            RETURNS TRIGGER
            LANGUAGE PLPGSQL
            AS
        $$
        DECLARE
            ardate timestamp;
        BEGIN

            -- if deleted was a 'real' tick then convert first repeat to redpoint and possibly toprope repeat to toprope redpoint
            IF  OLD."ascentType" = 'redpoint' OR OLD."ascentType" = 'flash' OR OLD."ascentType" = 'onsight' THEN

                -- find first repeat by same user for same route and convert it to redpoint if such log exists
                UPDATE activity_route
                SET "ascentType" = 'redpoint'
                WHERE id = (
                    SELECT id FROM activity_route
                    WHERE "routeId" = OLD."routeId"
                    AND "userId" = OLD."userId"
                    AND "ascentType" = 'repeat'
                    ORDER BY date
                    LIMIT 1)
                RETURNING date INTO ardate;

                -- find first toprope repeat and if it is logged before the new redpoint ascent convert it to toprope redpoint
                -- that is: Find first TR Repeat and convert it to TR Redpoint, but only if: TR Repeat is before new Redpoint OR new Redpoint does not exist
                UPDATE activity_route
                SET "ascentType" = 't_redpoint'
                WHERE id =(
                    SELECT id FROM activity_route
                    WHERE "routeId" = OLD."routeId"
                    AND "userId" = OLD."userId"
                    AND (ardate IS NULL OR date < ardate)  -- if above update did nothing skip this condition
                    AND "ascentType" = 't_repeat'
                    ORDER BY date
                    LIMIT 1
                    );

            -- if deleted was a toprope tick then convert first toprope repeat to toprope redpoint but only if no real tick is in between
            ELSEIF OLD."ascentType" = 't_redpoint' OR OLD."ascentType" = 't_flash' OR OLD."ascentType" = 't_onsight' THEN

                -- find first real tick (if it exists) and save the time
                SELECT date INTO ardate
                FROM activity_route
                WHERE "routeId" = OLD."routeId"
                AND "userId" = OLD."userId"
                AND ("ascentType" = 'redpoint' OR "ascentType" = 'flash' OR "ascentType" = 'onsight')
                ORDER BY date
                LIMIT 1;

                -- convert first toprope repeat that might be logged before the possible real tick log to toprope redpoint
                UPDATE activity_route
                SET "ascentType" = 't_redpoint'
                WHERE id = (
                    SELECT id FROM activity_route
                    WHERE "routeId" = OLD."routeId"
                    AND "userId" = OLD."userId"
                    AND "ascentType" = 't_repeat'
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
    // this makes no sense, but for consistency down should restore state before the migration
    // in this case that means restoring the buggy version of the trigger
    await queryRunner.query(`        
        -- trigger for auto-converting first repeat after deleted tick into a redpoint if one such repeat exists
        -- should assume that tick (rp, os, f) is first and that repeat can only be after
        -- converts also first toprope repeat to toprope redpoint if one exists in between old and new 'real' tick
        -- also handles deleting toprope 'ticks' by converting toprope repeat to toprope redpoint
        -- expects activity_route row as input
        CREATE OR REPLACE FUNCTION convert_first_repeat_to_redpoint()
            RETURNS TRIGGER
            LANGUAGE PLPGSQL
            AS
        $$
        DECLARE
            arcreated timestamp;
        BEGIN

            -- if deleted was a 'real' tick then convert first repeat to redpoint and possibly toprope repeat to toprope redpoint
            IF  OLD."ascentType" = 'redpoint' OR OLD."ascentType" = 'flash' OR OLD."ascentType" = 'onsight' THEN
                
                -- find first repeat by same user for same route and convert it to redpoint if such log exists
                UPDATE activity_route
                SET "ascentType" = 'redpoint'
                WHERE id = (
                    SELECT id FROM activity_route
                    WHERE "routeId" = OLD."routeId"
                    AND "userId" = OLD."userId"
                    AND "ascentType" = 'repeat'
                    ORDER BY created
                    LIMIT 1)
                RETURNING created INTO arcreated;

                -- find first toprope repeat and if it is logged before the new redpoint ascent convert it to toprope redpoint
                -- that is: Find first TR Repeat and convert it to TR Redpoint, but only if: TR Repeat is before new Redpoint OR new Redpoint does not exist
                UPDATE activity_route
                SET "ascentType" = 't_redpoint'
                WHERE id =(
                    SELECT id FROM activity_route
                    WHERE "routeId" = OLD."routeId"
                    AND "userId" = OLD."userId"
                    AND (arcreated IS NULL OR created < arcreated)  -- if above update did nothing skip this condition
                    AND "ascentType" = 't_repeat'
                    ORDER BY created
                    LIMIT 1
                    );

            -- if deleted was a toprope tick then convert first toprope repeat to toprope redpoint but only if no real tick is in between
            ELSEIF OLD."ascentType" = 't_redpoint' OR OLD."ascentType" = 't_flash' OR OLD."ascentType" = 't_onsight' THEN
                
                -- find first real tick (if it exists) and save the time
                SELECT created INTO arcreated
                FROM activity_route
                WHERE "routeId" = OLD."routeId"
                AND "userId" = OLD."userId"
                AND ("ascentType" = 'redpoint' OR "ascentType" = 'flash' OR "ascentType" = 'onsight')
                ORDER BY created
                LIMIT 1;

                -- convert first toprope repeat that might be logged before the possible real tick log to toprope redpoint
                UPDATE activity_route
                SET "ascentType" = 't_redpoint'
                WHERE id = (
                    SELECT id FROM activity_route
                    WHERE "routeId" = OLD."routeId"
                    AND "userId" = OLD."userId"
                    AND "ascentType" = 't_repeat'
                    AND (arcreated IS NULL OR created < arcreated)
                    ORDER BY created
                    LIMIT 1
                    );
            END IF;
            
            RETURN NULL;
        END
        $$;
        `);
  }
}
