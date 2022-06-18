import {MigrationInterface, QueryRunner} from "typeorm";

export class hasUnpublishedContributionsFieldName1655569268823 implements MigrationInterface {
    name = 'hasUnpublishedContributionsFieldName1655569268823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "showPrivateEntries" TO "hasUnpublishedContributions"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "hasUnpublishedContributions" TO "showPrivateEntries"`);
    }

}
