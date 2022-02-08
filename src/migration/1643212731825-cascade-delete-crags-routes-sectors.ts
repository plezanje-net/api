import { MigrationInterface, QueryRunner } from 'typeorm';

export class cascadeDeleteCragsRoutesSectors1643212731825
  implements MigrationInterface {
  name = 'cascadeDeleteCragsRoutesSectors1643212731825';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_a96b20ea74a1f9fd048093143d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_a05ad82a595340696de65f7ec38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_09448fcefb6d065d9ad09d7a22e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_ab658297e41b589fe04fa13c14f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_6167c683c3c25c2690a4fb82f24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" DROP CONSTRAINT "FK_42c68e444fd3ec48f66854897e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" DROP CONSTRAINT "FK_8e284cf2399299bb4a94aa9b7ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rating" DROP CONSTRAINT "FK_d27aa63516652f5e49b6379e065"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_event" DROP CONSTRAINT "FK_2504808be354765577883a52e63"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_6429a184ba403a6d346f59436fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_6ee50bb725ec5b94b0a2f988331"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grading_system_route_type" DROP CONSTRAINT "FK_e41703030af5829df36af0eaa50"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_a96b20ea74a1f9fd048093143d9" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_a05ad82a595340696de65f7ec38" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_ab658297e41b589fe04fa13c14f" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_6167c683c3c25c2690a4fb82f24" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_09448fcefb6d065d9ad09d7a22e" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ADD CONSTRAINT "FK_42c68e444fd3ec48f66854897e9" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" ADD CONSTRAINT "FK_8e284cf2399299bb4a94aa9b7ba" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rating" ADD CONSTRAINT "FK_d27aa63516652f5e49b6379e065" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_event" ADD CONSTRAINT "FK_2504808be354765577883a52e63" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_6ee50bb725ec5b94b0a2f988331" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_6429a184ba403a6d346f59436fa" FOREIGN KEY ("sectorId") REFERENCES "sector"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "grading_system_route_type" ADD CONSTRAINT "FK_e41703030af5829df36af0eaa50" FOREIGN KEY ("gradingSystemId") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "grading_system_route_type" DROP CONSTRAINT "FK_e41703030af5829df36af0eaa50"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_6ee50bb725ec5b94b0a2f988331"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_event" DROP CONSTRAINT "FK_2504808be354765577883a52e63"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rating" DROP CONSTRAINT "FK_d27aa63516652f5e49b6379e065"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" DROP CONSTRAINT "FK_8e284cf2399299bb4a94aa9b7ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" DROP CONSTRAINT "FK_42c68e444fd3ec48f66854897e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_09448fcefb6d065d9ad09d7a22e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_6167c683c3c25c2690a4fb82f24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_ab658297e41b589fe04fa13c14f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_a05ad82a595340696de65f7ec38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_a96b20ea74a1f9fd048093143d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_6429a184ba403a6d346f59436fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_6429a184ba403a6d346f59436fa" FOREIGN KEY ("sectorId") REFERENCES "sector"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "grading_system_route_type" ADD CONSTRAINT "FK_e41703030af5829df36af0eaa50" FOREIGN KEY ("gradingSystemId") REFERENCES "grading_system"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_6ee50bb725ec5b94b0a2f988331" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_event" ADD CONSTRAINT "FK_2504808be354765577883a52e63" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rating" ADD CONSTRAINT "FK_d27aa63516652f5e49b6379e065" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" ADD CONSTRAINT "FK_8e284cf2399299bb4a94aa9b7ba" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ADD CONSTRAINT "FK_42c68e444fd3ec48f66854897e9" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_6167c683c3c25c2690a4fb82f24" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_ab658297e41b589fe04fa13c14f" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_09448fcefb6d065d9ad09d7a22e" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_a05ad82a595340696de65f7ec38" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_a96b20ea74a1f9fd048093143d9" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
