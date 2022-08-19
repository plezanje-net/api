import {MigrationInterface, QueryRunner} from "typeorm";

export class starRatingUniqueByUserRoute1660917286801 implements MigrationInterface {
    name = 'starRatingUniqueByUserRoute1660917286801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "star_rating_vote" DROP CONSTRAINT "FK_8e9d40091ce33caabaf43da8950"`);
        await queryRunner.query(`ALTER TABLE "star_rating_vote" DROP CONSTRAINT "FK_59cdf2bf94368127c5f8b6096ee"`);
        await queryRunner.query(`ALTER TABLE "star_rating_vote" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "star_rating_vote" ALTER COLUMN "routeId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "star_rating_vote" ADD CONSTRAINT "UQ_f813b639d85decc8ae33e17d2e4" UNIQUE ("routeId", "userId")`);
        await queryRunner.query(`ALTER TABLE "star_rating_vote" ADD CONSTRAINT "FK_8e9d40091ce33caabaf43da8950" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "star_rating_vote" ADD CONSTRAINT "FK_59cdf2bf94368127c5f8b6096ee" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "star_rating_vote" DROP CONSTRAINT "FK_59cdf2bf94368127c5f8b6096ee"`);
        await queryRunner.query(`ALTER TABLE "star_rating_vote" DROP CONSTRAINT "FK_8e9d40091ce33caabaf43da8950"`);
        await queryRunner.query(`ALTER TABLE "star_rating_vote" DROP CONSTRAINT "UQ_f813b639d85decc8ae33e17d2e4"`);
        await queryRunner.query(`ALTER TABLE "star_rating_vote" ALTER COLUMN "routeId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "star_rating_vote" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "star_rating_vote" ADD CONSTRAINT "FK_59cdf2bf94368127c5f8b6096ee" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "star_rating_vote" ADD CONSTRAINT "FK_8e9d40091ce33caabaf43da8950" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
