import { MigrationInterface, QueryRunner } from 'typeorm';

export class minMaxRouteDifficultyOnCrag1641238046424
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            -- update min and max route difficulty of route on crag table
            CREATE OR REPLACE FUNCTION min_max_route_difficulty_of_crag()
            RETURNS TRIGGER
            LANGUAGE PLPGSQL
            AS
            $$
            DECLARE
                mindiff integer;
                maxdiff integer;
            BEGIN
                -- get min and max difficulty of all routes for the crag to which a route that has been added/deleted/modified belongs to
                SELECT INTO mindiff, maxdiff
                    min(r.difficulty), max(r.difficulty)
                FROM route r
                WHERE "cragId" = COALESCE(NEW."cragId", OLD."cragId");

                UPDATE crag
                SET "minDifficulty" = mindiff,
                    "maxDifficulty" = maxdiff
                WHERE id = COALESCE(NEW."cragId", OLD."cragId");

                RETURN NEW;
            END
            $$;        
        `);

    await queryRunner.query(`
        -- add trigger to find min and max route difficulty of a crag when a route is added, updated or removed
        DROP TRIGGER IF EXISTS crag_min_max_route_difficulty ON route;
        CREATE TRIGGER crag_min_max_route_difficulty
        AFTER INSERT OR UPDATE OR DELETE
        ON route
        FOR EACH ROW
        EXECUTE PROCEDURE min_max_route_difficulty_of_crag();    
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS crag_min_max_route_difficulty ON route;`,
    );

    await queryRunner.query(
      `DROP FUNCTION IF EXISTS min_max_route_difficulty_of_crag();`,
    );
  }
}
