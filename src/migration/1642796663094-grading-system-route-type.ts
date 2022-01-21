import { MigrationInterface, QueryRunner } from 'typeorm';

export class gradingSystemRouteType1642796663094 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`truncate table grading_system_route_type;`);
    await queryRunner.query(
      `insert into grading_system_route_type select * from route_type_grading_system;`,
    );
    await queryRunner.query(`drop table route_type_grading_system;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "route_type_grading_system" ("routeTypeId" character varying NOT NULL, "gradingSystemId" character varying NOT NULL, CONSTRAINT "PK_58dbc4abf8b467c7470cdbff052" PRIMARY KEY ("routeTypeId", "gradingSystemId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_876495711515bf4f3b34f8172f" ON "route_type_grading_system" ("routeTypeId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_874ecc4fd3a131710ddc26558a" ON "route_type_grading_system" ("gradingSystemId") `,
    );

    await queryRunner.query(`truncate table route_type_grading_system;`);

    await queryRunner.query(
      `insert into route_type_grading_system select * from grading_system_route_type;`,
    );
  }
}
