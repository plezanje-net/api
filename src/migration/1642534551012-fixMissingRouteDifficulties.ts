import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixMissingRouteDifficulties1642534551012
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `update route
        set "isProject" = true, "defaultGradingSystemId"='french'
        where (legacy::json -> 'RouteID')::jsonb = '17464'`,
    );

    await queryRunner.query(
      `update route
        set "isProject"=true, "defaultGradingSystemId"='french'
        where (legacy::json -> 'RouteID')::jsonb ='23696'`,
    );

    await queryRunner.query(
      `update route
        set "isProject"=true, "defaultGradingSystemId"='french'
        where (legacy::json -> 'RouteID')::jsonb ='14153'`,
    );

    await queryRunner.query(
      `update route
        set "routeTypeId"='boulder', "defaultGradingSystemId"='font', difficulty=1250
        where (legacy::json -> 'RouteID')::jsonb ='12427'`,
    );

    await queryRunner.query(
      `update route
        set "routeTypeId"='boulder', "defaultGradingSystemId"='font', difficulty=1450
        where (legacy::json -> 'RouteID')::jsonb ='12428'`,
    );

    await queryRunner.query(
      `update route
        set "routeTypeId"='boulder', "defaultGradingSystemId"='font', difficulty=1650
        where (legacy::json -> 'RouteID')::jsonb ='12426'`,
    );

    await queryRunner.query(
      `update route
        set "routeTypeId"='boulder', "defaultGradingSystemId"='font', difficulty=1700
        where (legacy::json -> 'RouteID')::jsonb ='12414'`,
    );

    await queryRunner.query(
      `update route
        set "routeTypeId"='boulder', "defaultGradingSystemId"='font', difficulty=1750
        where (legacy::json -> 'RouteID')::jsonb ='12425'`,
    );

    await queryRunner.query(
      `update route
        set difficulty=300
        where (legacy::json -> 'RouteID')::jsonb ='15741'`,
    );

    await queryRunner.query(
      `update route
        set difficulty=900
        where (legacy::json -> 'RouteID')::jsonb ='19971'`,
    );

    await queryRunner.query(
      `update route
        set difficulty=400
        where (legacy::json -> 'RouteID')::jsonb ='15740'`,
    );

    await queryRunner.query(
      `update route
        set difficulty = 325, "defaultGradingSystemId"='angle'
        where (legacy::json -> 'RouteID')::jsonb = '14045' or (legacy::json -> 'RouteID')::jsonb = '37743' or (legacy::json -> 'RouteID')::jsonb = '34699'`,
    );
    await queryRunner.query(
      `update route
        set difficulty = 275, "defaultGradingSystemId"='angle'
        where (legacy::json -> 'RouteID')::jsonb in ('33276', '12422', '12424', '16334', '21210', '34734')`,
    );
    await queryRunner.query(
      `update route
        set difficulty = 225, "defaultGradingSystemId"='angle'
        where (legacy::json -> 'RouteID')::jsonb ='21211'`,
    );
    await queryRunner.query(
      `update route
        set difficulty=600, "defaultGradingSystemId"='ifas'
        where (legacy::json -> 'RouteID')::jsonb ='13617'`,
    );
    await queryRunner.query(
      `update route
        set difficulty=700, "defaultGradingSystemId"='ifas'
        where (legacy::json -> 'RouteID')::jsonb ='13619'`,
    );
    await queryRunner.query(
      `update route
        set difficulty=350, "defaultGradingSystemId"='ifas'
        where (legacy::json -> 'RouteID')::jsonb ='13624'`,
    );
    await queryRunner.query(
      `update route
        set difficulty=350, "defaultGradingSystemId"='ifas'
        where (legacy::json -> 'RouteID')::jsonb ='13625'`,
    );
    await queryRunner.query(
      `update route
        set difficulty=750, "defaultGradingSystemId"='ifas'
        where (legacy::json -> 'RouteID')::jsonb ='13626'`,
    );
    await queryRunner.query(
      `update route
        set difficulty=550, "defaultGradingSystemId"='ifas'
        where (legacy::json -> 'RouteID')::jsonb ='19978'`,
    );
    await queryRunner.query(
      `update route
        set difficulty=250, "defaultGradingSystemId"='ifas'
        where (legacy::json -> 'RouteID')::jsonb ='19979'`,
    );
    await queryRunner.query(
      `update route
        set difficulty=400, "defaultGradingSystemId"='ifas'
        where (legacy::json -> 'RouteID')::jsonb ='28370'`,
    );
    await queryRunner.query(
      `insert into difficulty_vote(difficulty, "userId", "routeId", "includedInCalculation", "isBase")
        select difficulty, null, id, true, true
        from route
        where (legacy::json -> 'RouteID')::jsonb in ('12427','12428','12426','12414','12425','15741','19971','15740','14045','37743','34699','33276', '12422', '12424', '16334', '21210', '34734','21211','13617','13619','13624','13625','13626','19978','19979','28370')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
