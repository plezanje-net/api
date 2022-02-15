import { MigrationInterface, QueryRunner } from 'typeorm';

export class makePitchDifficultyANumber1644437266639
  implements MigrationInterface {
  name = 'makePitchDifficultyANumber1644437266639';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pitch" ADD "difficultyTemp" double precision`,
    );

    // update most of the pitches by looking up the grade table
    await queryRunner.query(`
        UPDATE pitch p
            SET "difficultyTemp" = (
                SELECT g.difficulty
                FROM grade AS g
                WHERE g."gradingSystemId"='french' AND g.name = p.difficulty
            )`);

    // get pitches for which the grade/diffiiculty pair hasn't been found
    const pitches = await queryRunner.query(
      `SELECT id, difficulty FROM pitch WHERE "difficultyTemp" IS NULL order by difficulty`,
    );

    // manually convert grade to difficulty by custom lookup below
    pitches.forEach(async pitch => {
      const difficulty = this.gradeToDifficulty(pitch.difficulty);
      if (difficulty) {
        await queryRunner.query(
          `UPDATE pitch SET "difficultyTemp" = ${difficulty} WHERE id = '${pitch.id}'`,
        );
      }
    });

    // for these few remaining special cases do a custom update
    // these two pitches belong to route Stara in Osp, and today have a grade (it used to be P or A0)
    await queryRunner.query(`UPDATE pitch SET "difficultyTemp" = 1750
        WHERE (legacy::json -> 'PitchID')::JSONB = '828' OR  (legacy::json -> 'PitchID')::JSONB = '827'`);
    // therefore we should also update the route's difficulty>
    await queryRunner.query(`UPDATE difficulty_vote SET difficulty = 1750 
        WHERE "routeId" = (SELECT "routeId" FROM pitch WHERE (legacy::json -> 'PitchID')::JSONB = '828') AND "isBase" = true`);

    // last two pitches seem to be projects so we need isProject flag on pitch table as well
    await queryRunner.query(
      `ALTER TABLE "pitch" ADD "isProject" boolean NOT NULL DEFAULT false`,
    );
    // then set the remaining two pitches to project and set their difficulty to null
    await queryRunner.query(`UPDATE pitch SET "difficultyTemp" = null, "isProject" = true
        WHERE (legacy::json -> 'PitchID')::JSONB = '1910' OR  (legacy::json -> 'PitchID')::JSONB = '1373'`);

    // we can now drop the column difficulty (string), and rename difficultyTemp to difficulty (number)
    await queryRunner.query(`ALTER TABLE "pitch" DROP COLUMN "difficulty"`);
    await queryRunner.query(
      `ALTER TABLE "pitch" RENAME COLUMN "difficultyTemp" TO "difficulty"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pitch" DROP COLUMN "difficultyTemp"`);
    await queryRunner.query(`ALTER TABLE "pitch" DROP COLUMN "isProject"`);
    await queryRunner.query(
      `ALTER TABLE "pitch" ADD "difficulty" character varying`,
    );
  }

  gradeToDifficulty(grade: string) {
    switch (grade) {
      case '1-2':
        return 150;
      case '3a':
        return 300;
      case '4':
        return 400;
      case '5':
        return 600;
      case '5+':
      case '5a/A1':
        return 700;
      case '5b/A1':
        return 800;
      case '5c/6a':
        return 975;
      case '6a/a+':
        return 1025;
      case '6a/A0':
        return 1000;
      case '6a/A1':
        return 1000;
      case '6a+/b':
        return 1075;
      case '6b/A0':
        return 1100;
      case '6c+/7a':
        return 1275;
      case '6c+/A0':
        return 1250;
      case '6c/A0':
        return 1200;
      case '6c/c+':
        return 1225;
      case '7a+?':
        return 1350;
      case '7a/a+':
        return 1325;
      case '7a+/b':
        return 1375;
      case '7b+/c':
        return 1475;
      case '7c+/8a':
        return 1575;
      case '8a/a+':
        return 1625;
      default:
        return false;
    }
  }
}
