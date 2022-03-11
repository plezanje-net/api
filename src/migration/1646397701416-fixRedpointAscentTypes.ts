import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixRedpointAscentTypes1646397701416 implements MigrationInterface {
  // Update all redpoint ascents that are not the first (datewise) tick ascents. Convert them to repeats.
  // like so>
  //    for each distinct (user, route) tuple, get the id of ar that represents the first time the route was ticked
  //    convert all redpoints to repeat but exclude ar's that meet the above condition
  // note: need to order by ascentType as well because many activity_routes have exactly the same datetime and ordering is then random which yields unpredictable results (but we know that rp after os should be converted to repeat ...)
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE activity_route
        SET "ascentType"='repeat'
        WHERE
            "ascentType" = 'redpoint'
            AND id NOT IN (
                SELECT DISTINCT ON (ar."userId", ar."routeId") ar.id 
                FROM activity_route ar
                WHERE "ascentType" IN ('redpoint', 'onsight', 'flash')
                ORDER BY ar."userId", ar."routeId", ar.created ASC, ar."ascentType" ASC
            )
        `);

    //  Update all top rope redpoint ascents that are preceeded by either a 'redpoint tick' or a proper lead tick. Convert them to toprope repeats.
    await queryRunner.query(`
        UPDATE activity_route
        SET "ascentType"='t_repeat'
        WHERE
            "ascentType" = 't_redpoint'
            AND id NOT IN (
                SELECT DISTINCT ON (ar."userId", ar."routeId") ar.id
                FROM activity_route ar
                WHERE "ascentType" in ('redpoint', 'onsight', 'flash', 't_onsight', 't_flash', 't_redpoint')
                ORDER BY ar."userId", ar."routeId", ar.created ASC, ar."ascentType" ASC
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore logged ascentTypes from legacy field
    // maybe one day... :)
  }
}
