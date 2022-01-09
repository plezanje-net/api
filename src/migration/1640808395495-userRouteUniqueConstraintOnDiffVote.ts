import {MigrationInterface, QueryRunner} from "typeorm";

export class userRouteUniqueConstraintOnDiffVote1640808395495 implements MigrationInterface {
    name = 'userRouteUniqueConstraintOnDiffVote1640808395495'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "difficulty_vote" ALTER COLUMN "includedInCalculation" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "difficulty_vote" ALTER COLUMN "includedInCalculation" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "difficulty_vote" ADD CONSTRAINT "UQ_94157d2971371af83a760bd0c3a" UNIQUE ("routeId", "userId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "difficulty_vote" DROP CONSTRAINT "UQ_94157d2971371af83a760bd0c3a"`);
        await queryRunner.query(`ALTER TABLE "difficulty_vote" ALTER COLUMN "includedInCalculation" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "difficulty_vote" ALTER COLUMN "includedInCalculation" SET NOT NULL`);
    }

}
