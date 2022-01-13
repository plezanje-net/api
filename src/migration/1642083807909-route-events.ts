import {MigrationInterface, QueryRunner} from "typeorm";

export class routeEvents1642083807909 implements MigrationInterface {
    name = 'routeEvents1642083807909'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "route_event" ("id" character varying NOT NULL, "author" character varying NOT NULL, "eventType" character varying, "eventDate" TIMESTAMP NOT NULL, "showFullDate" boolean NOT NULL DEFAULT true, "created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), "legacy" character varying, "routeId" uuid, "userId" uuid, CONSTRAINT "PK_71f2e1858117ffff5f16c74452a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "route_event" ADD CONSTRAINT "FK_2504808be354765577883a52e63" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "route_event" ADD CONSTRAINT "FK_04b73fdbc27bd862c2e360e787f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "route_event" DROP CONSTRAINT "FK_04b73fdbc27bd862c2e360e787f"`);
        await queryRunner.query(`ALTER TABLE "route_event" DROP CONSTRAINT "FK_2504808be354765577883a52e63"`);
        await queryRunner.query(`DROP TABLE "route_event"`);
    }

}
