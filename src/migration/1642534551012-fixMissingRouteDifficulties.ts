import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixMissingRouteDifficulties1642534551012
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `insert into grading_system (id, name, position)
        values ('ifas', 'IFAS', 1100)`,
    );

    await queryRunner.query(
      `insert into route_type_grading_system ("routeTypeId", "gradingSystemId")
        values ('combined', 'ifas')`,
    );

    await queryRunner.query(
      `insert into grade (name, difficulty, "gradingSystemId")
        values ('32°',225,'angle'),('45°',275,'angle'),('55°',325,'angle')`,
    );

    await queryRunner.query(
      `insert into grade (name, difficulty, "gradingSystemId")
        values ('F-',200,'ifas'),
        ('F',250,'ifas'),
        ('F+',300,'ifas'),
        ('PD-',350,'ifas'),
        ('PD',400,'ifas'),
        ('PD+',450,'ifas'),
        ('AD-',500,'ifas'),
        ('AD',550,'ifas'),
        ('AD+',600,'ifas'),
        ('D-',650,'ifas'),
        ('D',700,'ifas'),
        ('D+',750,'ifas'),
        ('TD-',800,'ifas'),
        ('TD',850,'ifas'),
        ('TD+',900,'ifas'),
        ('ED1-',950,'ifas'),
        ('ED1',1000,'ifas'),
        ('ED1+',1050,'ifas'),
        ('ED2-',1100,'ifas'),
        ('ED2',1150,'ifas'),
        ('ED2+',1200,'ifas'),
        ('ED3-',1250,'ifas'),
        ('ED3',1300,'ifas'),
        ('ED3+',1350,'ifas'),
        ('ED4-',1400,'ifas'),
        ('ED4',1450,'ifas'),
        ('ED4+',1500,'ifas'),
        ('ABO-',1550,'ifas'),
        ('ABO',1600,'ifas'),
        ('ABO+',1650,'ifas')`,
    );

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
