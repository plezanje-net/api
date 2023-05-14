import { MigrationInterface, QueryRunner } from 'typeorm';

export class addScoreFields1683455045404 implements MigrationInterface {
  name = 'addScoreFields1683455045404';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD "order_score" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD "ranking_score" double precision`,
    );

    // set ranking scores for all activity routes
    await queryRunner.query(
      `update activity_route ar
      set ranking_score = case ar.ascent_type
          when 'onsight' then coalesce(r.difficulty + 100, 0)
          when 'flash' then coalesce(r.difficulty + 50, 0)
          when 'redpoint' then coalesce(r.difficulty, 0)
          when 'repeat' then coalesce(r.difficulty - 10, 0)
          when 'allfree' then coalesce(r.difficulty * 0.01, 0)
          when 'aid' then coalesce(r.difficulty * 0.001, 0)
          when 'attempt' then coalesce(r.difficulty * 0.0001, 0)
          else 0 end
      from route r
      where r.id = ar.route_id;`,
    );

    // set ranking scores for all activity routes
    await queryRunner.query(
      `update activity_route ar
    set order_score = case ar.ascent_type
        when 'onsight' then coalesce(r.difficulty + 100, 0)
        when 'flash' then coalesce(r.difficulty + 50, 0)
        when 'redpoint' then coalesce(r.difficulty, 0)
        when 'repeat' then coalesce(r.difficulty - 10, 0)
        when 'allfree' then coalesce(r.difficulty * 0.01, 0)
        when 'aid' then coalesce(r.difficulty * 0.001, 0)
        when 'attempt' then coalesce(r.difficulty * 0.0001, 0)
        when 't_onsight' then coalesce((r.difficulty + 100) * 0.0001, 0)
        when 't_flash' then coalesce((r.difficulty + 50) * 0.0001, 0)
        when 't_redpoint' then coalesce(r.difficulty * 0.0001, 0)
        when 't_repeat' then coalesce((r.difficulty - 10) * 0.0001, 0)
        when 't_allfree' then coalesce(r.difficulty * 0.01 * 0.0001, 0)
        when 't_aid' then coalesce(r.difficulty * 0.001 * 0.0001, 0)
        when 't_attempt' then coalesce(r.difficulty * 0.0001 * 0.0001, 0)
        else 0 end
    from route r
    where r.id = ar.route_id;`,
    );

    // now that all scores are filled, set both columns to non nullable
    await queryRunner.query(
      `ALTER TABLE "activity_route" ALTER COLUMN "order_score" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ALTER COLUMN "ranking_score" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP COLUMN "ranking_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP COLUMN "order_score"`,
    );
  }
}
