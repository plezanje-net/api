import { MigrationInterface, QueryRunner } from 'typeorm';

export class recountCragRoutes1641235194341 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        -- update number of routes on crag table
        CREATE OR REPLACE FUNCTION recount_routes_of_crag()
        RETURNS TRIGGER
        LANGUAGE PLPGSQL
        AS
        $$
        DECLARE
            numroutes integer;
        BEGIN
            -- get number of routes for the crag whose route is being inserted or deleted
            SELECT COUNT (*) INTO numroutes
            FROM crag c
            LEFT JOIN route r ON c.id = r."cragId"
            WHERE c.id = COALESCE(NEW."cragId", OLD."cragId");
        
            UPDATE crag
            SET "nrRoutes" = numroutes
            WHERE id = COALESCE(NEW."cragId", OLD."cragId");
        
            RETURN NEW;
        END
        $$;
    `);

    await queryRunner.query(`
        -- add trigger to recount number of routes on a crag whenever a route is added or deleted
        DROP TRIGGER IF EXISTS crag_route_count ON route;
        CREATE TRIGGER crag_route_count
        AFTER INSERT OR DELETE
        ON route
        FOR EACH ROW
        EXECUTE PROCEDURE recount_routes_of_crag();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS crag_route_count ON route;`,
    );

    await queryRunner.query(
      `DROP FUNCTION IF EXISTS recount_routes_of_crag();`,
    );
  }
}
