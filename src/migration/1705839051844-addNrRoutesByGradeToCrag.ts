import { MigrationInterface, QueryRunner } from 'typeorm';

type TGrade = {
  id: string;
  difficulty: number;
  name: string;
  gradingSystemId: string;
};

export class addNrRoutesByGradeToCrag1705839051844
  implements MigrationInterface
{
  name = 'addNrRoutesByGradeToCrag1705839051844';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "crag" ADD "nr_routes_by_grade" jsonb`,
    );

    // Get all grading systems and grades
    const gradingSystems = await queryRunner.query(
      `SELECT * FROM grading_system gs ORDER BY gs.position ASC`,
    );

    for (const gradingSystem of gradingSystems) {
      const grades = await queryRunner.query(
        `SELECT * FROM grade g WHERE grading_system_id = '${gradingSystem.id}' ORDER BY g.difficulty ASC`,
      );

      gradingSystem.grades = grades;
    }

    // Calculate all grade distros for all crags
    const crags = await queryRunner.query('SELECT id FROM crag');
    for (const crag of crags) {
      const routes = await queryRunner.query(
        `SELECT difficulty FROM route WHERE crag_id = '${crag.id}'`,
      );

      const roundedDiffCountsByGradingSystem = {};

      for (const gradingSystem of gradingSystems) {
        const grades = gradingSystem.grades;
        roundedDiffCountsByGradingSystem[gradingSystem.id] = {};

        for (let route of routes) {
          if (route.isProject) continue;

          const grade = await this.difficultyToGrade(route.difficulty, grades);

          if (
            roundedDiffCountsByGradingSystem[gradingSystem.id][
              grade.difficulty
            ] === undefined
          ) {
            roundedDiffCountsByGradingSystem[gradingSystem.id][
              grade.difficulty
            ] = 1;
          } else {
            roundedDiffCountsByGradingSystem[gradingSystem.id][
              grade.difficulty
            ]++;
          }
        }
      }

      await queryRunner.query(
        `UPDATE crag SET nr_routes_by_grade = '${JSON.stringify(
          roundedDiffCountsByGradingSystem,
        )}' WHERE id = '${crag.id}'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "crag" DROP COLUMN "nr_routes_by_grade"`,
    );
  }

  private async difficultyToGrade(difficulty: number, grades: TGrade[]) {
    let prevGrade: TGrade;
    let currGrade: TGrade;
    // assuming grades are ordered by difficulty low to high
    for (let i = 1; i < grades.length; i++) {
      prevGrade = grades[i - 1];
      currGrade = grades[i];

      if (currGrade.difficulty >= difficulty) {
        // are we closer to left or right 'whole' grade
        if (
          difficulty - prevGrade.difficulty <=
          currGrade.difficulty - difficulty
        ) {
          return prevGrade;
        } else {
          return currGrade;
        }
      }
    }
    // fallback to last (max) grade if this grading system does not have a grade of such difficulty
    return currGrade;
  }
}
