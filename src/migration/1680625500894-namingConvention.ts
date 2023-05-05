import { MigrationInterface, QueryRunner } from 'typeorm';

export class namingConvention1680625500894 implements MigrationInterface {
  name = 'namingConvention1680625500894';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "activity" RENAME COLUMN "cragId" TO "crag_id";
        ALTER TABLE "activity" RENAME COLUMN "iceFallId" TO "ice_fall_id";
        ALTER TABLE "activity" RENAME COLUMN "peakId" TO "peak_id";
        ALTER TABLE "activity" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "activity_route" RENAME COLUMN "activityId" TO "activity_id";
        ALTER TABLE "activity_route" RENAME COLUMN "routeId" TO "route_id";
        ALTER TABLE "activity_route" RENAME COLUMN "pitchId" TO "pitch_id";
        ALTER TABLE "activity_route" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "activity_route" RENAME COLUMN "ascentType" TO "ascent_type";
        ALTER TABLE "area" RENAME COLUMN "countryId" TO "country_id";
        ALTER TABLE "area" RENAME COLUMN "areaId" TO "area_id";
        ALTER TABLE "area" RENAME COLUMN "nrCrags" TO "nr_crags";
        ALTER TABLE "audit" RENAME COLUMN "entityId" TO "entity_id";
        ALTER TABLE "audit" RENAME COLUMN "dataBefore" TO "data_before";
        ALTER TABLE "audit" RENAME COLUMN "dataAfter" TO "data_after";
        ALTER TABLE "club_member" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "club_member" RENAME COLUMN "clubId" TO "club_id";
        ALTER TABLE "club_member" RENAME COLUMN "confirmationToken" TO "confirmation_token";
        ALTER TABLE "comment" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "comment" RENAME COLUMN "routeId" TO "route_id";
        ALTER TABLE "comment" RENAME COLUMN "cragId" TO "crag_id";
        ALTER TABLE "comment" RENAME COLUMN "iceFallId" TO "ice_fall_id";
        ALTER TABLE "comment" RENAME COLUMN "peakId" TO "peak_id";
        ALTER TABLE "comment" RENAME COLUMN "exposedUntil" TO "exposed_until";
        ALTER TABLE "country" RENAME COLUMN "nrCrags" TO "nr_crags";
        ALTER TABLE "crag" RENAME COLUMN "areaId" TO "area_id";
        ALTER TABLE "crag" RENAME COLUMN "peakId" TO "peak_id";
        ALTER TABLE "crag" RENAME COLUMN "countryId" TO "country_id";
        ALTER TABLE "crag" RENAME COLUMN "minDifficulty" TO "min_difficulty";
        ALTER TABLE "crag" RENAME COLUMN "maxDifficulty" TO "max_difficulty";
        ALTER TABLE "crag" RENAME COLUMN "defaultGradingSystemId" TO "default_grading_system_id";
        ALTER TABLE "crag" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "crag" RENAME COLUMN "nrRoutes" TO "nr_routes";
        ALTER TABLE "crag" RENAME COLUMN "publishStatus" TO "publish_status";
        ALTER TABLE "crag" RENAME COLUMN "isHidden" TO "is_hidden";
        ALTER TABLE "crag_books_book" RENAME COLUMN "cragId" TO "crag_id";
        ALTER TABLE "crag_books_book" RENAME COLUMN "bookId" TO "book_id";
        ALTER TABLE "crag_property" RENAME COLUMN "propertyTypeId" TO "property_type_id";
        ALTER TABLE "crag_property" RENAME COLUMN "stringValue" TO "string_value";
        ALTER TABLE "crag_property" RENAME COLUMN "textValue" TO "text_value";
        ALTER TABLE "crag_property" RENAME COLUMN "numValue" TO "num_value";
        ALTER TABLE "crag_property" RENAME COLUMN "cragId" TO "crag_id";
        ALTER TABLE "difficulty_vote" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "difficulty_vote" RENAME COLUMN "routeId" TO "route_id";
        ALTER TABLE "difficulty_vote" RENAME COLUMN "includedInCalculation" TO "included_in_calculation";
        ALTER TABLE "difficulty_vote" RENAME COLUMN "isBase" TO "is_base";
        ALTER TABLE "grade" RENAME COLUMN "gradingSystemId" TO "grading_system_id";
        ALTER TABLE "grading_system_route_type" RENAME COLUMN "routeTypeId" TO "route_type_id";
        ALTER TABLE "grading_system_route_type" RENAME COLUMN "gradingSystemId" TO "grading_system_id";
        ALTER TABLE "ice_fall" RENAME COLUMN "countryId" TO "country_id";
        ALTER TABLE "ice_fall" RENAME COLUMN "areaId" TO "area_id";
        ALTER TABLE "ice_fall" RENAME COLUMN "defaultGradingSystemId" TO "default_grading_system_id";
        ALTER TABLE "ice_fall_books_book" RENAME COLUMN "iceFallId" TO "ice_fall_id";
        ALTER TABLE "ice_fall_books_book" RENAME COLUMN "bookId" TO "book_id";
        ALTER TABLE "ice_fall_property" RENAME COLUMN "propertyTypeId" TO "property_type_id";
        ALTER TABLE "ice_fall_property" RENAME COLUMN "stringValue" TO "string_value";
        ALTER TABLE "ice_fall_property" RENAME COLUMN "textValue" TO "text_value";
        ALTER TABLE "ice_fall_property" RENAME COLUMN "numValue" TO "num_value";
        ALTER TABLE "ice_fall_property" RENAME COLUMN "iceFallId" TO "ice_fall_id";
        ALTER TABLE "image" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "image" RENAME COLUMN "areaId" TO "area_id";
        ALTER TABLE "image" RENAME COLUMN "cragId" TO "crag_id";
        ALTER TABLE "image" RENAME COLUMN "routeId" TO "route_id";
        ALTER TABLE "image" RENAME COLUMN "iceFallId" TO "ice_fall_id";
        ALTER TABLE "image" RENAME COLUMN "commentId" TO "comment_id";
        ALTER TABLE "image" RENAME COLUMN "peakId" TO "peak_id";
        ALTER TABLE "image" RENAME COLUMN "aspectRatio" TO "aspect_ratio";
        ALTER TABLE "image" RENAME COLUMN "maxIntrinsicWidth" TO "max_intrinsic_width";
        ALTER TABLE "peak" RENAME COLUMN "areaId" TO "area_id";
        ALTER TABLE "peak" RENAME COLUMN "countryId" TO "country_id";
        ALTER TABLE "peak_books_book" RENAME COLUMN "peakId" TO "peak_id";
        ALTER TABLE "peak_books_book" RENAME COLUMN "bookId" TO "book_id";
        ALTER TABLE "pitch" RENAME COLUMN "routeId" TO "route_id";
        ALTER TABLE "pitch" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "pitch" RENAME COLUMN "isProject" TO "is_project";
        ALTER TABLE "property_type" RENAME COLUMN "valueType" TO "value_type";
        ALTER TABLE "role" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "route" RENAME COLUMN "sectorId" TO "sector_id";
        ALTER TABLE "route" RENAME COLUMN "cragId" TO "crag_id";
        ALTER TABLE "route" RENAME COLUMN "routeTypeId" TO "route_type_id";
        ALTER TABLE "route" RENAME COLUMN "defaultGradingSystemId" TO "default_grading_system_id";
        ALTER TABLE "route" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "route" RENAME COLUMN "starRating" TO "star_rating";
        ALTER TABLE "route" RENAME COLUMN "isProject" TO "is_project";
        ALTER TABLE "route" RENAME COLUMN "publishStatus" TO "publish_status";
        ALTER TABLE "route_books_book" RENAME COLUMN "routeId" TO "route_id";
        ALTER TABLE "route_books_book" RENAME COLUMN "bookId" TO "book_id";
        ALTER TABLE "route_event" RENAME COLUMN "eventType" TO "event_type";
        ALTER TABLE "route_event" RENAME COLUMN "eventDate" TO "event_date";
        ALTER TABLE "route_event" RENAME COLUMN "routeId" TO "route_id";
        ALTER TABLE "route_event" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "route_event" RENAME COLUMN "showFullDate" TO "show_full_date";
        ALTER TABLE "route_property" RENAME COLUMN "propertyTypeId" TO "property_type_id";
        ALTER TABLE "route_property" RENAME COLUMN "stringValue" TO "string_value";
        ALTER TABLE "route_property" RENAME COLUMN "textValue" TO "text_value";
        ALTER TABLE "route_property" RENAME COLUMN "numValue" TO "num_value";
        ALTER TABLE "route_property" RENAME COLUMN "routeId" TO "route_id";
        ALTER TABLE "sector" RENAME COLUMN "cragId" TO "crag_id";
        ALTER TABLE "sector" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "sector" RENAME COLUMN "publishStatus" TO "publish_status";
        ALTER TABLE "star_rating_vote" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "star_rating_vote" RENAME COLUMN "routeId" TO "route_id";
        ALTER TABLE "user" RENAME COLUMN "passwordToken" TO "password_token";
        ALTER TABLE "user" RENAME COLUMN "confirmationToken" TO "confirmation_token";
        ALTER TABLE "user" RENAME COLUMN "lastPasswordChange" TO "last_password_change";
        ALTER TABLE "user" RENAME COLUMN "profileImageId" TO "profile_image_id";
        ALTER TABLE "user" RENAME COLUMN "isActive" TO "is_active";
        ALTER TABLE "user" RENAME COLUMN "isPublic" TO "is_public";
        ALTER TABLE "user" RENAME COLUMN "hasUnpublishedContributions" TO "has_unpublished_contributions";
      `);

    await queryRunner.query(
      `ALTER TABLE "role" DROP CONSTRAINT "FK_3e02d32dd4707c91433de0390ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_member" DROP CONSTRAINT "FK_1047687a2fa4d8aa55ce9ff46ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_member" DROP CONSTRAINT "FK_ba6f4421c170b49f0ca6ea52720"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_5c0981de5dc2a2222a1f0574859"`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" DROP CONSTRAINT "FK_53a36c2642b09e474534a5c13d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" DROP CONSTRAINT "FK_718d08509a4895f37a2a70b465d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grade" DROP CONSTRAINT "FK_fffa16e913eaf483cb7e776dc08"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" DROP CONSTRAINT "FK_6a195788507dd2367e76bfdadf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" DROP CONSTRAINT "FK_be4921538405d090ca0f909b8d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" DROP CONSTRAINT "FK_d9a2eb0e6e4a8e7c3516568c355"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_a96b20ea74a1f9fd048093143d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_01c5c187a3658e66c06e7afb897"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_c66cb2dfccd160ea0bff6bab318"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_a05ad82a595340696de65f7ec38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_ab658297e41b589fe04fa13c14f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_0613e7f6523de4f2cbb9201545c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_09448fcefb6d065d9ad09d7a22e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_aa7ec9ab343e6abf53aaa29d00c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_67ab23d4e8d3e74fe6c4ef3c936"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_dc40417dfa0c7fbd70b8eb880cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_6167c683c3c25c2690a4fb82f24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" DROP CONSTRAINT "FK_cae1d5b69fc10cb70c83f348702"`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" DROP CONSTRAINT "FK_48465cf333cad84a2a3ef535434"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_626d254ca76bdbb0be1aef6b7c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_3b16ef8dad0342ea8569caf0741"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_ddf8003d229c023dd29641c3cb0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" DROP CONSTRAINT "FK_917e2c3829ffac20bbb3b93543b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" DROP CONSTRAINT "FK_eadbb840424bf1e9b6b4cc483d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" DROP CONSTRAINT "FK_bdb8b8fdb931dc23ccfc234bde1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" DROP CONSTRAINT "FK_57c5b20f5db1b23f708d81dadad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" DROP CONSTRAINT "FK_c6dc3cd25d927e6aaea2a9a490b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" DROP CONSTRAINT "FK_3f7e3dea0cbd160c8bbc86ec0e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" DROP CONSTRAINT "FK_ed74ef0d9d6fd57eb480d8b6b86"`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" DROP CONSTRAINT "FK_36cae28a50bf55b91a15d25e90d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" DROP CONSTRAINT "FK_42c68e444fd3ec48f66854897e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" DROP CONSTRAINT "FK_8da47bd5a6c860045fa53911b68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" DROP CONSTRAINT "FK_8e284cf2399299bb4a94aa9b7ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" DROP CONSTRAINT "FK_8e9d40091ce33caabaf43da8950"`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" DROP CONSTRAINT "FK_59cdf2bf94368127c5f8b6096ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_event" DROP CONSTRAINT "FK_04b73fdbc27bd862c2e360e787f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_event" DROP CONSTRAINT "FK_2504808be354765577883a52e63"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_6ee50bb725ec5b94b0a2f988331"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_8720c83b6fdffcead06dd220703"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_5f1f8af943496a71fa29f6a44f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_45f1dd3d8849f393f429935beeb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_6429a184ba403a6d346f59436fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP CONSTRAINT "FK_e2996eef518bf566d4a92305101"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP CONSTRAINT "FK_8fcfc26571a56a81b37f74c6d28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP CONSTRAINT "FK_5d0f4cc17e126ad509bcb6b81f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP CONSTRAINT "FK_ebb17ba34f1d7783c1c146d062e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_property" DROP CONSTRAINT "FK_66aa9b1be26f87337745c8c82ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_property" DROP CONSTRAINT "FK_0c46cfe4ccdba50f112025d4bba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_property" DROP CONSTRAINT "FK_5127725de08e04ec7682162fa97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_property" DROP CONSTRAINT "FK_969f93aa39edbfb362506fd079f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_property" DROP CONSTRAINT "FK_0f46edec1a9d828cd4cdc7162d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_property" DROP CONSTRAINT "FK_ed7327e8c601718e963cdc655a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak_books_book" DROP CONSTRAINT "FK_6eb00ea7063b28380c1a50afca8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak_books_book" DROP CONSTRAINT "FK_2e7b12570bae2daeee0b7362e78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grading_system_route_type" DROP CONSTRAINT "FK_e41703030af5829df36af0eaa50"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grading_system_route_type" DROP CONSTRAINT "FK_fb92795cf33d418cb4a07772a38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_books_book" DROP CONSTRAINT "FK_66929c6c9ca3967f29e1ec54d83"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_books_book" DROP CONSTRAINT "FK_afa30f83400020b8dbc39427b46"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_books_book" DROP CONSTRAINT "FK_e94feb279ddaacbf626e5c9911e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_books_book" DROP CONSTRAINT "FK_0e2d561f05690e75a87568e21cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_books_book" DROP CONSTRAINT "FK_30867690ac76920e8d7434a9e84"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_books_book" DROP CONSTRAINT "FK_9916ebe855f6ee1fe71a47c28ee"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3a13acba521462ee9dbecca6f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_33c435f2f7a1dfe201806566e7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_40864ce351fe24a7f7229b0491"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4253a621975f5dad7c4c89fd1d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2e7b12570bae2daeee0b7362e7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6eb00ea7063b28380c1a50afca"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e41703030af5829df36af0eaa5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fb92795cf33d418cb4a07772a3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_66929c6c9ca3967f29e1ec54d8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_afa30f83400020b8dbc39427b4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0e2d561f05690e75a87568e21c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e94feb279ddaacbf626e5c9911"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_30867690ac76920e8d7434a9e8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9916ebe855f6ee1fe71a47c28e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_member" DROP CONSTRAINT "UQ_2c43d1e91c77185c7970b9ca11f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" DROP CONSTRAINT "UQ_94157d2971371af83a760bd0c3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" DROP CONSTRAINT "UQ_f813b639d85decc8ae33e17d2e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "UQ_dfed6177fa5752c50fafce148f7"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."crag_publishstatus_enum" RENAME TO "crag_publishstatus_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."crag_publish_status_enum" AS ENUM('draft', 'in_review', 'published')`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ALTER COLUMN "publish_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ALTER COLUMN "publish_status" TYPE "public"."crag_publish_status_enum" USING "publish_status"::"text"::"public"."crag_publish_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ALTER COLUMN "publish_status" SET DEFAULT 'published'`,
    );
    await queryRunner.query(`DROP TYPE "public"."crag_publishstatus_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sector_publishstatus_enum" RENAME TO "sector_publishstatus_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sector_publish_status_enum" AS ENUM('draft', 'in_review', 'published')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" ALTER COLUMN "publish_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" ALTER COLUMN "publish_status" TYPE "public"."sector_publish_status_enum" USING "publish_status"::"text"::"public"."sector_publish_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" ALTER COLUMN "publish_status" SET DEFAULT 'published'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."sector_publishstatus_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."route_publishstatus_enum" RENAME TO "route_publishstatus_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."route_publish_status_enum" AS ENUM('draft', 'in_review', 'published')`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ALTER COLUMN "publish_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ALTER COLUMN "publish_status" TYPE "public"."route_publish_status_enum" USING "publish_status"::"text"::"public"."route_publish_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ALTER COLUMN "publish_status" SET DEFAULT 'published'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."route_publishstatus_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."activity_route_ascenttype_enum" RENAME TO "activity_route_ascenttype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."activity_route_ascent_type_enum" AS ENUM('onsight', 'flash', 'redpoint', 'repeat', 'allfree', 'aid', 'attempt', 't_onsight', 't_flash', 't_redpoint', 't_repeat', 't_allfree', 't_aid', 't_attempt', 'tick')`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ALTER COLUMN "ascent_type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ALTER COLUMN "ascent_type" TYPE "public"."activity_route_ascent_type_enum" USING "ascent_type"::"text"::"public"."activity_route_ascent_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ALTER COLUMN "ascent_type" SET DEFAULT 'redpoint'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."activity_route_ascenttype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5fb6bdbd60d2584227a685b592" ON "crag" ("publish_status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e8bad0f8fd120cbc002decf101" ON "route" ("publish_status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_01dc528c981cf1f5b223c8f598" ON "activity_route" ("publish", "activity_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_de27c45a75648b7dd4ccfbf565" ON "activity_route" ("route_id", "publish") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5756ed4b7aae43b4e0b6c4497a" ON "peak_books_book" ("peak_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7a80d4df0000d02f6bf65c5d05" ON "peak_books_book" ("book_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5fd070e4bcf9e6335cdd2d3526" ON "grading_system_route_type" ("route_type_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_93f3781b6280a0e73040aed8cd" ON "grading_system_route_type" ("grading_system_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8c33efb5508151946accd35e26" ON "ice_fall_books_book" ("ice_fall_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1d30cbe90225b24c7807800c6e" ON "ice_fall_books_book" ("book_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_943025d81d41b7ee79e9783d21" ON "crag_books_book" ("crag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c0c50f88592b50bfb955151c5" ON "crag_books_book" ("book_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c4e2b10fc504e80363064f15ce" ON "route_books_book" ("route_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_916d311bca2e830a96c90434a6" ON "route_books_book" ("book_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "club_member" ADD CONSTRAINT "UQ_7835426fbdcab7105690d6a0ca2" UNIQUE ("user_id", "club_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ADD CONSTRAINT "UQ_1296a6e1b25ed472af5e657cc9d" UNIQUE ("route_id", "user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" ADD CONSTRAINT "UQ_4ebd2117fd620ae22edefacde87" UNIQUE ("route_id", "user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "UQ_d7ef21f203c02d7af7cbcf9eacb" UNIQUE ("slug", "crag_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ADD CONSTRAINT "FK_e3583d40265174efd29754a7c57" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_member" ADD CONSTRAINT "FK_439b7482544b3a96f620e5115d4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_member" ADD CONSTRAINT "FK_bde5bad4e43fbcefa06b9d6a9d9" FOREIGN KEY ("club_id") REFERENCES "club"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_938b0dfbabed6deaa4a9a91e919" FOREIGN KEY ("profile_image_id") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" ADD CONSTRAINT "FK_66fa0b1dea92ef95a36edae73a8" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" ADD CONSTRAINT "FK_3187cb7ec4c9a0df1875595d69b" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "grade" ADD CONSTRAINT "FK_a93cbc77947042b181e1f1b46d1" FOREIGN KEY ("grading_system_id") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD CONSTRAINT "FK_5bcb06cbe22429a3f40441b6486" FOREIGN KEY ("default_grading_system_id") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD CONSTRAINT "FK_8053d8b29347bbc5002aef159d3" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD CONSTRAINT "FK_949921f0147ed4d2afad61120d8" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_6e11e4ddff659edfe2fc742a9ee" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_a729d4d603345f17c4cfaa98e95" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_2635e1823b3979f2936373c3b11" FOREIGN KEY ("ice_fall_id") REFERENCES "ice_fall"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_480bf4bf9727b78c9d9bdf59426" FOREIGN KEY ("peak_id") REFERENCES "peak"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_b0b068a2be3e9a2ed6052786781" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_158fa7ee4b42d71670dc3d60b49" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_256247ce3969d3eb569e307fee8" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_fba4d6e605bba1529ce9abaa24e" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_1cf26bf5d68ba4de029fd9d668e" FOREIGN KEY ("ice_fall_id") REFERENCES "ice_fall"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_a8465170860679862ee499cbde0" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_3dccb6de32de750d77fc7a441c5" FOREIGN KEY ("peak_id") REFERENCES "peak"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" ADD CONSTRAINT "FK_6bc1ea3c3f9425405bf40f71022" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" ADD CONSTRAINT "FK_72da364c8ffb96c5b332ea314e1" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_312ccbf09cdfb2ea21c3cb3fb75" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_c19680a496b385932fb9849287f" FOREIGN KEY ("ice_fall_id") REFERENCES "ice_fall"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_cfea58c870d50fb01260c28d869" FOREIGN KEY ("peak_id") REFERENCES "peak"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_10bf0c2dd4736190070e8475119" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD CONSTRAINT "FK_d245eab8ad64876dba86b67cb87" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD CONSTRAINT "FK_c62418ff4b347155aa6e43d2bc2" FOREIGN KEY ("peak_id") REFERENCES "peak"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD CONSTRAINT "FK_fa12a751db3c6208a1368f8ae2e" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD CONSTRAINT "FK_4ea03386ad369c0cc53b6b8bd66" FOREIGN KEY ("default_grading_system_id") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD CONSTRAINT "FK_135e3e30e4ca3b15dbf6e724824" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" ADD CONSTRAINT "FK_83cce4f278b33a194585d5fdac7" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" ADD CONSTRAINT "FK_8c48b9c22ccac5bf209958698f5" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ADD CONSTRAINT "FK_411633e2a802cf28a4d191d959c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ADD CONSTRAINT "FK_7712911584f7b971b0d279c3c08" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" ADD CONSTRAINT "FK_79cab4a383821866b4de48b55c9" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" ADD CONSTRAINT "FK_c192a9131ad012451e258f03c49" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" ADD CONSTRAINT "FK_a37a68b6f012f59f5e4be388747" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" ADD CONSTRAINT "FK_56b6639ff2ef794f63ba5ec2829" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_event" ADD CONSTRAINT "FK_131716df7129f85f26c4e650f34" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_event" ADD CONSTRAINT "FK_d262eb7c69a72bf1758a414b0bf" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_106020da458170960f557e60874" FOREIGN KEY ("route_type_id") REFERENCES "route_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_beda36f68e830c3cba6d6a595bc" FOREIGN KEY ("default_grading_system_id") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_9ac356f81d0d11d183313d1ed1c" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_ad28420bdcf8db10938ffe1ac22" FOREIGN KEY ("sector_id") REFERENCES "sector"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_797177a310ed69b8ede51c81a55" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD CONSTRAINT "FK_eb98668378645ccf382e88ef150" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD CONSTRAINT "FK_7c100bfb4d800ca58b61cf482ca" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD CONSTRAINT "FK_08ccf250ee4afa0320eae33a724" FOREIGN KEY ("pitch_id") REFERENCES "pitch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD CONSTRAINT "FK_9ebe6a9002b3de5c2bd08cd2368" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_property" ADD CONSTRAINT "FK_5855b96084e11611925994d169d" FOREIGN KEY ("property_type_id") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_property" ADD CONSTRAINT "FK_4a1e3d2ff8fd32744f5b7a7b505" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_property" ADD CONSTRAINT "FK_d5631e2f9a293252a8f721f85df" FOREIGN KEY ("property_type_id") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_property" ADD CONSTRAINT "FK_87d50e9b66e2aba6673400c64a3" FOREIGN KEY ("ice_fall_id") REFERENCES "ice_fall"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_property" ADD CONSTRAINT "FK_98ebe763dfc72239094a5603597" FOREIGN KEY ("property_type_id") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_property" ADD CONSTRAINT "FK_b2d71a4cc8a635cf960c88ce19a" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak_books_book" ADD CONSTRAINT "FK_5756ed4b7aae43b4e0b6c4497aa" FOREIGN KEY ("peak_id") REFERENCES "peak"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak_books_book" ADD CONSTRAINT "FK_7a80d4df0000d02f6bf65c5d051" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "grading_system_route_type" ADD CONSTRAINT "FK_5fd070e4bcf9e6335cdd2d3526b" FOREIGN KEY ("route_type_id") REFERENCES "route_type"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "grading_system_route_type" ADD CONSTRAINT "FK_93f3781b6280a0e73040aed8cd7" FOREIGN KEY ("grading_system_id") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_books_book" ADD CONSTRAINT "FK_8c33efb5508151946accd35e26c" FOREIGN KEY ("ice_fall_id") REFERENCES "ice_fall"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_books_book" ADD CONSTRAINT "FK_1d30cbe90225b24c7807800c6ea" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_books_book" ADD CONSTRAINT "FK_943025d81d41b7ee79e9783d21d" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_books_book" ADD CONSTRAINT "FK_4c0c50f88592b50bfb955151c5d" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_books_book" ADD CONSTRAINT "FK_c4e2b10fc504e80363064f15cea" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_books_book" ADD CONSTRAINT "FK_916d311bca2e830a96c90434a67" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "activity" RENAME COLUMN "crag_id" TO "cragId";
        ALTER TABLE "activity" RENAME COLUMN "ice_fall_id" TO "iceFallId" ;
        ALTER TABLE "activity" RENAME COLUMN "peak_id" TO "peakId";
        ALTER TABLE "activity" RENAME COLUMN "user_id" TO "userId";
        ALTER TABLE "activity_route" RENAME COLUMN "activity_id" TO "activityId" ;
        ALTER TABLE "activity_route" RENAME COLUMN "route_id" TO "routeId" ;
        ALTER TABLE "activity_route" RENAME COLUMN "pitch_id" TO "pitchId" ;
        ALTER TABLE "activity_route" RENAME COLUMN "user_id" TO "userId";
        ALTER TABLE "activity_route" RENAME COLUMN "ascent_type" TO "ascentType" ;
        ALTER TABLE "area" RENAME COLUMN "country_id" TO "countryId" ;
        ALTER TABLE "area" RENAME COLUMN "area_id" TO "areaId";
        ALTER TABLE "area" RENAME COLUMN "nr_crags" TO "nrCrags" ;
        ALTER TABLE "audit" RENAME COLUMN "entity_id"TO "entityId" ;
        ALTER TABLE "audit" RENAME COLUMN "data_before" TO "dataBefore" ;
        ALTER TABLE "audit" RENAME COLUMN "data_after" TO "dataAfter" ;
        ALTER TABLE "club_member" RENAME COLUMN "user_id" TO "userId";
        ALTER TABLE "club_member" RENAME COLUMN "club_id" TO "clubId";
        ALTER TABLE "club_member" RENAME COLUMN "confirmation_token"TO "confirmationToken" ;
        ALTER TABLE "comment" RENAME COLUMN "user_id" TO "userId";
        ALTER TABLE "comment" RENAME COLUMN "route_id" TO "routeId" ;
        ALTER TABLE "comment" RENAME COLUMN "crag_id" TO "cragId";
        ALTER TABLE "comment" RENAME COLUMN "ice_fall_id" TO "iceFallId" ;
        ALTER TABLE "comment" RENAME COLUMN "peak_id" TO "peakId";
        ALTER TABLE "comment" RENAME COLUMN "exposed_until" TO "exposedUntil" ;
        ALTER TABLE "country" RENAME COLUMN "nr_crags" TO "nrCrags" ;
        ALTER TABLE "crag" RENAME COLUMN "area_id" TO "areaId";
        ALTER TABLE "crag" RENAME COLUMN "peak_id" TO "peakId";
        ALTER TABLE "crag" RENAME COLUMN "country_id" TO "countryId" ;
        ALTER TABLE "crag" RENAME COLUMN "min_difficulty" TO "minDifficulty" ;
        ALTER TABLE "crag" RENAME COLUMN "max_difficulty" TO "maxDifficulty" ;
        ALTER TABLE "crag" RENAME COLUMN "default_grading_system_id" TO "defaultGradingSystemId";
        ALTER TABLE "crag" RENAME COLUMN "user_id" TO "userId";
        ALTER TABLE "crag" RENAME COLUMN "nr_routes"TO "nrRoutes" ;
        ALTER TABLE "crag" RENAME COLUMN "publish_status" TO "publishStatus" ;
        ALTER TABLE "crag" RENAME COLUMN "is_hidden"TO "isHidden" ;
        ALTER TABLE "crag_books_book" RENAME COLUMN"crag_id" TO "cragId";
        ALTER TABLE "crag_books_book" RENAME COLUMN"book_id" TO "bookId";
        ALTER TABLE "crag_property" RENAME COLUMN "property_type_id" TO "propertyTypeId";
        ALTER TABLE "crag_property" RENAME COLUMN "string_value"TO "stringValue";
        ALTER TABLE "crag_property" RENAME COLUMN "text_value" TO "textValue" ;
        ALTER TABLE "crag_property" RENAME COLUMN "num_value"TO "numValue" ;
        ALTER TABLE "crag_property" RENAME COLUMN "crag_id" TO "cragId";
        ALTER TABLE "difficulty_vote" RENAME COLUMN"user_id" TO "userId";
        ALTER TABLE "difficulty_vote" RENAME COLUMN"route_id" TO "routeId" ;
        ALTER TABLE "difficulty_vote" RENAME COLUMN"included_in_calculation" TO "includedInCalculation" ;
        ALTER TABLE "difficulty_vote" RENAME COLUMN"is_base" TO "isBase";
        ALTER TABLE "grade" RENAME COLUMN "grading_system_id" TO "gradingSystemId" ;
        ALTER TABLE "grading_system_route_type" RENAME COLUMN "route_type_id" TO "routeTypeId";
        ALTER TABLE "grading_system_route_type" RENAME COLUMN "grading_system_id" TO "gradingSystemId" ;
        ALTER TABLE "ice_fall" RENAME COLUMN "country_id" TO "countryId" ;
        ALTER TABLE "ice_fall" RENAME COLUMN "area_id" TO "areaId";
        ALTER TABLE "ice_fall" RENAME COLUMN "default_grading_system_id" TO "defaultGradingSystemId";
        ALTER TABLE "ice_fall_books_book" RENAME COLUMN "ice_fall_id" TO "iceFallId" ;
        ALTER TABLE "ice_fall_books_book" RENAME COLUMN "book_id" TO "bookId";
        ALTER TABLE "ice_fall_property" RENAME COLUMN "property_type_id" TO "propertyTypeId";
        ALTER TABLE "ice_fall_property" RENAME COLUMN "string_value"TO "stringValue";
        ALTER TABLE "ice_fall_property" RENAME COLUMN "text_value" TO "textValue" ;
        ALTER TABLE "ice_fall_property" RENAME COLUMN "num_value"TO "numValue" ;
        ALTER TABLE "ice_fall_property" RENAME COLUMN "ice_fall_id" TO "iceFallId" ;
        ALTER TABLE "image" RENAME COLUMN "user_id" TO "userId";
        ALTER TABLE "image" RENAME COLUMN "area_id" TO "areaId";
        ALTER TABLE "image" RENAME COLUMN "crag_id" TO "cragId";
        ALTER TABLE "image" RENAME COLUMN "route_id" TO "routeId" ;
        ALTER TABLE "image" RENAME COLUMN "ice_fall_id" TO "iceFallId" ;
        ALTER TABLE "image" RENAME COLUMN "comment_id" TO "commentId" ;
        ALTER TABLE "image" RENAME COLUMN "peak_id" TO "peakId";
        ALTER TABLE "image" RENAME COLUMN "aspect_ratio"TO "aspectRatio";
        ALTER TABLE "image" RENAME COLUMN "max_intrinsic_width" TO "maxIntrinsicWidth" ;
        ALTER TABLE "peak" RENAME COLUMN "area_id" TO "areaId";
        ALTER TABLE "peak" RENAME COLUMN "country_id" TO "countryId" ;
        ALTER TABLE "peak_books_book" RENAME COLUMN"peak_id" TO "peakId";
        ALTER TABLE "peak_books_book" RENAME COLUMN"book_id" TO "bookId";
        ALTER TABLE "pitch" RENAME COLUMN "route_id" TO "routeId" ;
        ALTER TABLE "pitch" RENAME COLUMN "user_id" TO "userId";
        ALTER TABLE "pitch" RENAME COLUMN "is_project" TO "isProject" ;
        ALTER TABLE "property_type" RENAME COLUMN "value_type" TO "valueType" ;
        ALTER TABLE "role" RENAME COLUMN "user_id" TO "userId";
        ALTER TABLE "route" RENAME COLUMN "sector_id"TO "sectorId" ;
        ALTER TABLE "route" RENAME COLUMN "crag_id" TO "cragId";
        ALTER TABLE "route" RENAME COLUMN "route_type_id" TO "routeTypeId";
        ALTER TABLE "route" RENAME COLUMN "default_grading_system_id" TO "defaultGradingSystemId";
        ALTER TABLE "route" RENAME COLUMN "user_id" TO "userId";
        ALTER TABLE "route" RENAME COLUMN "star_rating" TO "starRating" ;
        ALTER TABLE "route" RENAME COLUMN "is_project" TO "isProject" ;
        ALTER TABLE "route" RENAME COLUMN "publish_status" TO "publishStatus" ;
        ALTER TABLE "route_books_book" RENAME COLUMN "route_id" TO "routeId" ;
        ALTER TABLE "route_books_book" RENAME COLUMN "book_id" TO "bookId";
        ALTER TABLE "route_event" RENAME COLUMN "event_type" TO "eventType" ;
        ALTER TABLE "route_event" RENAME COLUMN "event_date" TO "eventDate" ;
        ALTER TABLE "route_event" RENAME COLUMN "route_id" TO "routeId" ;
        ALTER TABLE "route_event" RENAME COLUMN "user_id" TO "userId";
        ALTER TABLE "route_event" RENAME COLUMN "show_full_date" TO "showFullDate" ;
        ALTER TABLE "route_property" RENAME COLUMN "property_type_id" TO "propertyTypeId";
        ALTER TABLE "route_property" RENAME COLUMN "string_value"TO "stringValue";
        ALTER TABLE "route_property" RENAME COLUMN "text_value" TO "textValue" ;
        ALTER TABLE "route_property" RENAME COLUMN "num_value"TO "numValue" ;
        ALTER TABLE "route_property" RENAME COLUMN "route_id" TO "routeId" ;
        ALTER TABLE "sector" RENAME COLUMN"crag_id" TO "cragId";
        ALTER TABLE "sector" RENAME COLUMN"user_id" TO "userId";
        ALTER TABLE "sector" RENAME COLUMN"publish_status" TO "publishStatus" ;
        ALTER TABLE "star_rating_vote" RENAME COLUMN "user_id" TO "userId";
        ALTER TABLE "star_rating_vote" RENAME COLUMN "route_id" TO "routeId" ;
        ALTER TABLE "user" RENAME COLUMN "password_token" TO "passwordToken" ;
        ALTER TABLE "user" RENAME COLUMN "confirmation_token"TO "confirmationToken" ;
        ALTER TABLE "user" RENAME COLUMN "last_password_change" TO "lastPasswordChange" ;
        ALTER TABLE "user" RENAME COLUMN "profile_image_id" TO "profileImageId";
        ALTER TABLE "user" RENAME COLUMN "is_active"TO "isActive" ;
        ALTER TABLE "user" RENAME COLUMN "is_public"TO "isPublic" ;
        ALTER TABLE "user" RENAME COLUMN "has_unpublished_contributions" TO "hasUnpublishedContributions";    
    `);

    await queryRunner.query(
      `ALTER TABLE "route_books_book" DROP CONSTRAINT "FK_916d311bca2e830a96c90434a67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_books_book" DROP CONSTRAINT "FK_c4e2b10fc504e80363064f15cea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_books_book" DROP CONSTRAINT "FK_4c0c50f88592b50bfb955151c5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_books_book" DROP CONSTRAINT "FK_943025d81d41b7ee79e9783d21d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_books_book" DROP CONSTRAINT "FK_1d30cbe90225b24c7807800c6ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_books_book" DROP CONSTRAINT "FK_8c33efb5508151946accd35e26c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grading_system_route_type" DROP CONSTRAINT "FK_93f3781b6280a0e73040aed8cd7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grading_system_route_type" DROP CONSTRAINT "FK_5fd070e4bcf9e6335cdd2d3526b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak_books_book" DROP CONSTRAINT "FK_7a80d4df0000d02f6bf65c5d051"`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak_books_book" DROP CONSTRAINT "FK_5756ed4b7aae43b4e0b6c4497aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_property" DROP CONSTRAINT "FK_b2d71a4cc8a635cf960c88ce19a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_property" DROP CONSTRAINT "FK_98ebe763dfc72239094a5603597"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_property" DROP CONSTRAINT "FK_87d50e9b66e2aba6673400c64a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_property" DROP CONSTRAINT "FK_d5631e2f9a293252a8f721f85df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_property" DROP CONSTRAINT "FK_4a1e3d2ff8fd32744f5b7a7b505"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_property" DROP CONSTRAINT "FK_5855b96084e11611925994d169d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP CONSTRAINT "FK_9ebe6a9002b3de5c2bd08cd2368"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP CONSTRAINT "FK_08ccf250ee4afa0320eae33a724"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP CONSTRAINT "FK_7c100bfb4d800ca58b61cf482ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" DROP CONSTRAINT "FK_eb98668378645ccf382e88ef150"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_797177a310ed69b8ede51c81a55"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_ad28420bdcf8db10938ffe1ac22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_9ac356f81d0d11d183313d1ed1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_beda36f68e830c3cba6d6a595bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "FK_106020da458170960f557e60874"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_event" DROP CONSTRAINT "FK_d262eb7c69a72bf1758a414b0bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_event" DROP CONSTRAINT "FK_131716df7129f85f26c4e650f34"`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" DROP CONSTRAINT "FK_56b6639ff2ef794f63ba5ec2829"`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" DROP CONSTRAINT "FK_a37a68b6f012f59f5e4be388747"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" DROP CONSTRAINT "FK_c192a9131ad012451e258f03c49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" DROP CONSTRAINT "FK_79cab4a383821866b4de48b55c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" DROP CONSTRAINT "FK_7712911584f7b971b0d279c3c08"`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" DROP CONSTRAINT "FK_411633e2a802cf28a4d191d959c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" DROP CONSTRAINT "FK_8c48b9c22ccac5bf209958698f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" DROP CONSTRAINT "FK_83cce4f278b33a194585d5fdac7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" DROP CONSTRAINT "FK_135e3e30e4ca3b15dbf6e724824"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" DROP CONSTRAINT "FK_4ea03386ad369c0cc53b6b8bd66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" DROP CONSTRAINT "FK_fa12a751db3c6208a1368f8ae2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" DROP CONSTRAINT "FK_c62418ff4b347155aa6e43d2bc2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" DROP CONSTRAINT "FK_d245eab8ad64876dba86b67cb87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_10bf0c2dd4736190070e8475119"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_cfea58c870d50fb01260c28d869"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_c19680a496b385932fb9849287f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_312ccbf09cdfb2ea21c3cb3fb75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" DROP CONSTRAINT "FK_72da364c8ffb96c5b332ea314e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" DROP CONSTRAINT "FK_6bc1ea3c3f9425405bf40f71022"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_3dccb6de32de750d77fc7a441c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_a8465170860679862ee499cbde0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_1cf26bf5d68ba4de029fd9d668e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_fba4d6e605bba1529ce9abaa24e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_256247ce3969d3eb569e307fee8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_158fa7ee4b42d71670dc3d60b49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_b0b068a2be3e9a2ed6052786781"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_480bf4bf9727b78c9d9bdf59426"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_2635e1823b3979f2936373c3b11"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_a729d4d603345f17c4cfaa98e95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_6e11e4ddff659edfe2fc742a9ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" DROP CONSTRAINT "FK_949921f0147ed4d2afad61120d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" DROP CONSTRAINT "FK_8053d8b29347bbc5002aef159d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" DROP CONSTRAINT "FK_5bcb06cbe22429a3f40441b6486"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grade" DROP CONSTRAINT "FK_a93cbc77947042b181e1f1b46d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" DROP CONSTRAINT "FK_3187cb7ec4c9a0df1875595d69b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" DROP CONSTRAINT "FK_66fa0b1dea92ef95a36edae73a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_938b0dfbabed6deaa4a9a91e919"`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_member" DROP CONSTRAINT "FK_bde5bad4e43fbcefa06b9d6a9d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_member" DROP CONSTRAINT "FK_439b7482544b3a96f620e5115d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" DROP CONSTRAINT "FK_e3583d40265174efd29754a7c57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" DROP CONSTRAINT "UQ_d7ef21f203c02d7af7cbcf9eacb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" DROP CONSTRAINT "UQ_4ebd2117fd620ae22edefacde87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" DROP CONSTRAINT "UQ_1296a6e1b25ed472af5e657cc9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_member" DROP CONSTRAINT "UQ_7835426fbdcab7105690d6a0ca2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_916d311bca2e830a96c90434a6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c4e2b10fc504e80363064f15ce"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c0c50f88592b50bfb955151c5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_943025d81d41b7ee79e9783d21"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1d30cbe90225b24c7807800c6e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8c33efb5508151946accd35e26"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_93f3781b6280a0e73040aed8cd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5fd070e4bcf9e6335cdd2d3526"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7a80d4df0000d02f6bf65c5d05"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5756ed4b7aae43b4e0b6c4497a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_de27c45a75648b7dd4ccfbf565"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_01dc528c981cf1f5b223c8f598"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e8bad0f8fd120cbc002decf101"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5fb6bdbd60d2584227a685b592"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."activity_route_ascenttype_enum_old" AS ENUM('onsight', 'flash', 'redpoint', 'repeat', 'allfree', 'aid', 'attempt', 't_onsight', 't_flash', 't_redpoint', 't_repeat', 't_allfree', 't_aid', 't_attempt', 'tick')`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ALTER COLUMN "ascent_type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ALTER COLUMN "ascent_type" TYPE "public"."activity_route_ascenttype_enum_old" USING "ascent_type"::"text"::"public"."activity_route_ascenttype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ALTER COLUMN "ascent_type" SET DEFAULT 'redpoint'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."activity_route_ascent_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."activity_route_ascenttype_enum_old" RENAME TO "activity_route_ascenttype_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."route_publishstatus_enum_old" AS ENUM('draft', 'in_review', 'published')`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ALTER COLUMN "publish_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ALTER COLUMN "publish_status" TYPE "public"."route_publishstatus_enum_old" USING "publish_status"::"text"::"public"."route_publishstatus_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ALTER COLUMN "publish_status" SET DEFAULT 'published'`,
    );
    await queryRunner.query(`DROP TYPE "public"."route_publish_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."route_publishstatus_enum_old" RENAME TO "route_publishstatus_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sector_publishstatus_enum_old" AS ENUM('draft', 'in_review', 'published')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" ALTER COLUMN "publish_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" ALTER COLUMN "publish_status" TYPE "public"."sector_publishstatus_enum_old" USING "publish_status"::"text"::"public"."sector_publishstatus_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" ALTER COLUMN "publish_status" SET DEFAULT 'published'`,
    );
    await queryRunner.query(`DROP TYPE "public"."sector_publish_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sector_publishstatus_enum_old" RENAME TO "sector_publishstatus_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."crag_publishstatus_enum_old" AS ENUM('draft', 'in_review', 'published')`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ALTER COLUMN "publish_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ALTER COLUMN "publish_status" TYPE "public"."crag_publishstatus_enum_old" USING "publish_status"::"text"::"public"."crag_publishstatus_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ALTER COLUMN "publish_status" SET DEFAULT 'published'`,
    );
    await queryRunner.query(`DROP TYPE "public"."crag_publish_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."crag_publishstatus_enum_old" RENAME TO "crag_publishstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "UQ_dfed6177fa5752c50fafce148f7" UNIQUE ("crag_id", "slug")`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" ADD CONSTRAINT "UQ_f813b639d85decc8ae33e17d2e4" UNIQUE ("user_id", "route_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ADD CONSTRAINT "UQ_94157d2971371af83a760bd0c3a" UNIQUE ("user_id", "route_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_member" ADD CONSTRAINT "UQ_2c43d1e91c77185c7970b9ca11f" UNIQUE ("user_id", "club_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9916ebe855f6ee1fe71a47c28e" ON "route_books_book" ("route_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_30867690ac76920e8d7434a9e8" ON "route_books_book" ("book_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e94feb279ddaacbf626e5c9911" ON "crag_books_book" ("crag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0e2d561f05690e75a87568e21c" ON "crag_books_book" ("book_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_afa30f83400020b8dbc39427b4" ON "ice_fall_books_book" ("ice_fall_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_66929c6c9ca3967f29e1ec54d8" ON "ice_fall_books_book" ("book_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fb92795cf33d418cb4a07772a3" ON "grading_system_route_type" ("route_type_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e41703030af5829df36af0eaa5" ON "grading_system_route_type" ("grading_system_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6eb00ea7063b28380c1a50afca" ON "peak_books_book" ("book_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2e7b12570bae2daeee0b7362e7" ON "peak_books_book" ("peak_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4253a621975f5dad7c4c89fd1d" ON "activity_route" ("publish", "route_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_40864ce351fe24a7f7229b0491" ON "activity_route" ("publish", "activity_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_33c435f2f7a1dfe201806566e7" ON "route" ("publish_status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a3a13acba521462ee9dbecca6f" ON "crag" ("publish_status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "route_books_book" ADD CONSTRAINT "FK_9916ebe855f6ee1fe71a47c28ee" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_books_book" ADD CONSTRAINT "FK_30867690ac76920e8d7434a9e84" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_books_book" ADD CONSTRAINT "FK_0e2d561f05690e75a87568e21cb" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_books_book" ADD CONSTRAINT "FK_e94feb279ddaacbf626e5c9911e" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_books_book" ADD CONSTRAINT "FK_afa30f83400020b8dbc39427b46" FOREIGN KEY ("ice_fall_id") REFERENCES "ice_fall"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_books_book" ADD CONSTRAINT "FK_66929c6c9ca3967f29e1ec54d83" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "grading_system_route_type" ADD CONSTRAINT "FK_fb92795cf33d418cb4a07772a38" FOREIGN KEY ("route_type_id") REFERENCES "route_type"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "grading_system_route_type" ADD CONSTRAINT "FK_e41703030af5829df36af0eaa50" FOREIGN KEY ("grading_system_id") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak_books_book" ADD CONSTRAINT "FK_2e7b12570bae2daeee0b7362e78" FOREIGN KEY ("peak_id") REFERENCES "peak"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak_books_book" ADD CONSTRAINT "FK_6eb00ea7063b28380c1a50afca8" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_property" ADD CONSTRAINT "FK_ed7327e8c601718e963cdc655a1" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_property" ADD CONSTRAINT "FK_0f46edec1a9d828cd4cdc7162d2" FOREIGN KEY ("property_type_id") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_property" ADD CONSTRAINT "FK_969f93aa39edbfb362506fd079f" FOREIGN KEY ("property_type_id") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_property" ADD CONSTRAINT "FK_5127725de08e04ec7682162fa97" FOREIGN KEY ("ice_fall_id") REFERENCES "ice_fall"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_property" ADD CONSTRAINT "FK_0c46cfe4ccdba50f112025d4bba" FOREIGN KEY ("property_type_id") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_property" ADD CONSTRAINT "FK_66aa9b1be26f87337745c8c82ef" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD CONSTRAINT "FK_ebb17ba34f1d7783c1c146d062e" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD CONSTRAINT "FK_5d0f4cc17e126ad509bcb6b81f7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD CONSTRAINT "FK_8fcfc26571a56a81b37f74c6d28" FOREIGN KEY ("pitch_id") REFERENCES "pitch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_route" ADD CONSTRAINT "FK_e2996eef518bf566d4a92305101" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_6429a184ba403a6d346f59436fa" FOREIGN KEY ("sector_id") REFERENCES "sector"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_45f1dd3d8849f393f429935beeb" FOREIGN KEY ("route_type_id") REFERENCES "route_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_5f1f8af943496a71fa29f6a44f9" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_8720c83b6fdffcead06dd220703" FOREIGN KEY ("default_grading_system_id") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_6ee50bb725ec5b94b0a2f988331" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_event" ADD CONSTRAINT "FK_2504808be354765577883a52e63" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_event" ADD CONSTRAINT "FK_04b73fdbc27bd862c2e360e787f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" ADD CONSTRAINT "FK_59cdf2bf94368127c5f8b6096ee" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "star_rating_vote" ADD CONSTRAINT "FK_8e9d40091ce33caabaf43da8950" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" ADD CONSTRAINT "FK_8e284cf2399299bb4a94aa9b7ba" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pitch" ADD CONSTRAINT "FK_8da47bd5a6c860045fa53911b68" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ADD CONSTRAINT "FK_42c68e444fd3ec48f66854897e9" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "difficulty_vote" ADD CONSTRAINT "FK_36cae28a50bf55b91a15d25e90d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" ADD CONSTRAINT "FK_ed74ef0d9d6fd57eb480d8b6b86" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sector" ADD CONSTRAINT "FK_3f7e3dea0cbd160c8bbc86ec0e0" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD CONSTRAINT "FK_c6dc3cd25d927e6aaea2a9a490b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD CONSTRAINT "FK_57c5b20f5db1b23f708d81dadad" FOREIGN KEY ("peak_id") REFERENCES "peak"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD CONSTRAINT "FK_bdb8b8fdb931dc23ccfc234bde1" FOREIGN KEY ("default_grading_system_id") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD CONSTRAINT "FK_eadbb840424bf1e9b6b4cc483d9" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag" ADD CONSTRAINT "FK_917e2c3829ffac20bbb3b93543b" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_ddf8003d229c023dd29641c3cb0" FOREIGN KEY ("peak_id") REFERENCES "peak"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_3b16ef8dad0342ea8569caf0741" FOREIGN KEY ("ice_fall_id") REFERENCES "ice_fall"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_626d254ca76bdbb0be1aef6b7c9" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" ADD CONSTRAINT "FK_48465cf333cad84a2a3ef535434" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" ADD CONSTRAINT "FK_cae1d5b69fc10cb70c83f348702" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_6167c683c3c25c2690a4fb82f24" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_dc40417dfa0c7fbd70b8eb880cc" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_67ab23d4e8d3e74fe6c4ef3c936" FOREIGN KEY ("peak_id") REFERENCES "peak"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_aa7ec9ab343e6abf53aaa29d00c" FOREIGN KEY ("ice_fall_id") REFERENCES "ice_fall"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_09448fcefb6d065d9ad09d7a22e" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_0613e7f6523de4f2cbb9201545c" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_ab658297e41b589fe04fa13c14f" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_a05ad82a595340696de65f7ec38" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_c66cb2dfccd160ea0bff6bab318" FOREIGN KEY ("peak_id") REFERENCES "peak"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_01c5c187a3658e66c06e7afb897" FOREIGN KEY ("ice_fall_id") REFERENCES "ice_fall"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_a96b20ea74a1f9fd048093143d9" FOREIGN KEY ("crag_id") REFERENCES "crag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD CONSTRAINT "FK_d9a2eb0e6e4a8e7c3516568c355" FOREIGN KEY ("default_grading_system_id") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD CONSTRAINT "FK_be4921538405d090ca0f909b8d6" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall" ADD CONSTRAINT "FK_6a195788507dd2367e76bfdadf0" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "grade" ADD CONSTRAINT "FK_fffa16e913eaf483cb7e776dc08" FOREIGN KEY ("grading_system_id") REFERENCES "grading_system"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" ADD CONSTRAINT "FK_718d08509a4895f37a2a70b465d" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "peak" ADD CONSTRAINT "FK_53a36c2642b09e474534a5c13d3" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_5c0981de5dc2a2222a1f0574859" FOREIGN KEY ("profile_image_id") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_member" ADD CONSTRAINT "FK_ba6f4421c170b49f0ca6ea52720" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_member" ADD CONSTRAINT "FK_1047687a2fa4d8aa55ce9ff46ad" FOREIGN KEY ("club_id") REFERENCES "club"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ADD CONSTRAINT "FK_3e02d32dd4707c91433de0390ea" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
