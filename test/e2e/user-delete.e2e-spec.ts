import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { CragsModule } from '../../src/crags/crags.module';
import { UsersModule } from '../../src/users/users.module';
import {
  comment,
  initializeDbConn,
  logRoutes,
  prepareEnvironment,
  seedDatabase,
} from './helpers';
import {
  AscentType,
  PublishType,
} from '../../src/activities/entities/activity-route.entity';
import { CommentType } from '../../src/crags/entities/comment.entity';
import { env } from 'process';
import * as fs from 'fs';
import { sizes } from '../../src/crags/entities/image.entity';

describe('UserDelete', () => {
  let app: INestApplication;
  let conn: DataSource;
  let queryRunner: QueryRunner;

  let mockData: any;

  beforeAll(async () => {
    prepareEnvironment();
    process.env.STORAGE_PATH = `${__dirname}/dummy-storage`;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UsersModule, CragsModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();

    conn = await initializeDbConn(app);
    queryRunner = conn.createQueryRunner();

    mockData = await seedDatabase(queryRunner, app);

    // Add more user data that the tests will use

    // 1. Activities, activity routes, difficulty votes and star rating votes
    // Add an activity with some activity routes to the user that will be deleted
    const activityCreateResponse = await logRoutes(
      app,
      mockData.users.basicUser1,
      mockData.crags.simpleCrag,
      [
        {
          route: mockData.crags.simpleCrag.sectors.simpleSector1.routes[0],
          ascentType: AscentType.redpoint,
          publishType: PublishType.PRIVATE,
          votedDifficulty: 1100,
          votedStarRating: 2,
        },
        {
          route: mockData.crags.simpleCrag.sectors.simpleSector1.routes[1],
          ascentType: AscentType.onsight,
          publishType: PublishType.PUBLIC,
        },
      ],
    );

    mockData.toBeDeletedUser = {
      activityId: activityCreateResponse.body.data.createActivity.id,
      activityRoutesIds: [
        mockData.crags.simpleCrag.sectors.simpleSector1.routes[0].id,
        mockData.crags.simpleCrag.sectors.simpleSector1.routes[1].id,
      ],
    };

    // Add some activities on same route from other users
    await logRoutes(app, mockData.users.basicUser2, mockData.crags.simpleCrag, [
      {
        route: mockData.crags.simpleCrag.sectors.simpleSector1.routes[0],
        ascentType: AscentType.redpoint,
        publishType: PublishType.PRIVATE,
        votedDifficulty: 1200,
        votedStarRating: 2,
      },
    ]);
    await logRoutes(app, mockData.users.basicUser3, mockData.crags.simpleCrag, [
      {
        route: mockData.crags.simpleCrag.sectors.simpleSector1.routes[0],
        ascentType: AscentType.redpoint,
        publishType: PublishType.PRIVATE,
        votedDifficulty: 1300,
        votedStarRating: 2,
      },
    ]);
    // difficulty of route [0] is now 1150

    // Add some more activities on the same route from other users to get a star rating consensus
    await logRoutes(app, mockData.users.basicUser4, mockData.crags.simpleCrag, [
      {
        route: mockData.crags.simpleCrag.sectors.simpleSector1.routes[0],
        ascentType: AscentType.redpoint,
        publishType: PublishType.PRIVATE,
        votedStarRating: 2,
      },
    ]);
    await logRoutes(app, mockData.users.basicUser5, mockData.crags.simpleCrag, [
      {
        route: mockData.crags.simpleCrag.sectors.simpleSector1.routes[0],
        ascentType: AscentType.redpoint,
        publishType: PublishType.PRIVATE,
        votedStarRating: 2,
      },
    ]);
    // starRating of route [0] is now 2

    // 1.a
    // Add some difficulty votes from a tobedeleted user without activity routes
    // This is a legacy scenario, since on the old page it was possible to vote on difficulty without ticking the route
    await queryRunner.query(
      `INSERT INTO difficulty_vote (route_id, user_id, difficulty) VALUES ('${mockData.crags.simpleCrag.sectors.simpleSector1.routes[2].id}', '${mockData.users.basicUser1.id}', 1300),
      ('${mockData.crags.simpleCrag.sectors.simpleSector1.routes[3].id}', '${mockData.users.basicUser1.id}', 3500)`,
    );

    // Add some difficulty votes for route [2] from other users
    await queryRunner.query(
      `INSERT INTO difficulty_vote (route_id, user_id, difficulty) VALUES ('${mockData.crags.simpleCrag.sectors.simpleSector1.routes[2].id}', '${mockData.users.basicUser2.id}', 1400),
      ('${mockData.crags.simpleCrag.sectors.simpleSector1.routes[2].id}', '${mockData.users.basicUser3.id}', 1500)
      `,
    );
    // difficulty of route [2] is now 1350

    // 2. Comments
    // Add some comments from a user that will be deleted
    const commentOnEntities = [
      {
        entity: 'route',
        id: mockData.crags.simpleCrag.sectors.simpleSector1.routes[0].id,
      },
      { entity: 'crag', id: mockData.crags.simpleCrag.id },
      { entity: 'icefall', id: mockData.icefalls.simpleIcefall.id },
      { entity: 'peak', id: mockData.peaks.simplePeak.id },
    ];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const commentExposedUntils = [tomorrow, null];

    for (const commentOnEntity of commentOnEntities) {
      for (const commentType of Object.values(CommentType)) {
        for (const commentExposedUntil of commentExposedUntils) {
          await comment(
            app,
            mockData.users.basicUser1,
            commentType,
            commentOnEntity.entity === 'route' ? commentOnEntity.id : null,
            commentOnEntity.entity === 'crag' ? commentOnEntity.id : null,
            commentOnEntity.entity === 'icefall' ? commentOnEntity.id : null,
            commentOnEntity.entity === 'peak' ? commentOnEntity.id : null,
            commentExposedUntil,
          );
        }
      }
    }

    // 3. Images
    // Add some images uploaded by the tobedeleted user
    // Upload a route image
    const routeImageUploadResponse = await request(app.getHttpServer())
      .post('/upload/image')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field(
        'entityId',
        mockData.crags.simpleCrag.sectors.simpleSector1.routes[0].id,
      )
      .field('entityType', 'route')
      .field('title', 'An image of a route')
      .field('author', 'Slavko Majonezic')
      .field('description', 'This is this route')
      .attach('image', `${__dirname}/testImage.jpg`);

    // save image id to test removal in a test below
    mockData.toBeDeletedUser.routeImageId = JSON.parse(
      routeImageUploadResponse.text,
    ).id;

    // Upload a crag image
    const cragImageUploadResponse = await request(app.getHttpServer())
      .post('/upload/image')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('entityId', mockData.crags.simpleCrag.id)
      .field('entityType', 'crag')
      .field('title', 'An image of a crag')
      .field('author', 'Slavko Majonezic')
      .field('description', 'This is this crag')
      .attach('image', `${__dirname}/testImage.jpg`);

    // save image id to test removal in a test below
    mockData.toBeDeletedUser.cragImageId = JSON.parse(
      cragImageUploadResponse.text,
    ).id;

    // 4. Roles
    // Make the tobedeleted user an editor so that we can test roles removal
    // TODO: admin role in this context should become editor role
    await queryRunner.query(
      `INSERT INTO role (role, user_id) VALUES ('admin', '${mockData.users.basicUser1.id}')`,
    );

    // 5. Clubs
    // User is already in a club. Done by db seeding.

    // 6. Contributables
    // User is already the contributor of some contributables. Done by db seeding.

    // 7. Route events
    // User's route events added by seed.
  });

  it('should fail to delete a user if logged in with a normal user', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .send({
        query: `
          mutation {
            deleteUser(
              id: "${mockData.users.editorUser.id}"
            )
          }
        `,
      })
      .expect(200);

    expect(response.body.errors[0].extensions.response.statusCode).toBe(403);
  });

  it('should fail to delete a user if logged in with an admin (editor) user', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.editorUser.authToken}`)
      .send({
        query: `
          mutation {
            deleteUser(
              id: "${mockData.users.basicUser1.id}"
            )
          }
        `,
      })
      .expect(200);

    expect(response.body.errors[0].extensions.response.statusCode).toBe(403);
  });

  it('should succeed to delete a user with a superadmin user', async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.superAdminUser.authToken}`)
      .send({
        query: `
          mutation {
            deleteUser(
              id: "${mockData.users.basicUser1.id}"
            )
          }
        `,
      })
      .expect(200);

    const userResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .send({
        query: `
            query {
                profile {
                    id
                    firstname
                    lastname
                }
            }
        `,
      })
      .expect(200);

    expect(userResponse.body.errors[0].extensions.exception.status).toBe(401);

    const users = await queryRunner.query(
      `SELECT * FROM public.user WHERE id = '${mockData.users.basicUser1.id}'`,
    );
    expect(users).toHaveLength(0);
  });

  it('should delete all user activities and activity routes when deleting a user', async () => {
    // fetch activities and see that the activity of the deleted user is gone
    const activities = await queryRunner.query(
      `SELECT * FROM activity WHERE id = '${mockData.toBeDeletedUser.activityId}'`,
    );
    expect(activities).toHaveLength(0);

    // fetch activity routes and see that the activity routes of the deleted user are gone
    const activityRoutes = await queryRunner.query(
      `SELECT * FROM activity_route WHERE id IN (${mockData.toBeDeletedUser.activityRoutesIds.map(
        (routeId: string) => "'" + routeId + "'",
      )})`,
    );
    expect(activityRoutes).toHaveLength(0);
  });

  it('should recalculate route difficulty of a route for which the deleted user voted on difficulty', async () => {
    const response0 = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
        query {
          route(id: "${mockData.crags.simpleCrag.sectors.simpleSector1.routes[0].id}")
          {
            difficulty
          }
        }
      `,
      })
      .expect(200);

    expect(response0.body.data.route.difficulty).toBe(1200);

    const response2 = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
        query {
          route(id: "${mockData.crags.simpleCrag.sectors.simpleSector1.routes[2].id}")
          {
            difficulty
          }
        }
      `,
      })
      .expect(200);

    expect(response2.body.data.route.difficulty).toBe(1400);
  });

  it('should recalculate route star rating of a route for which the deleted user voted on star rating', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
        query {
          route(id: "${mockData.crags.simpleCrag.sectors.simpleSector1.routes[0].id}")
          {
            starRating
          }
        }
      `,
      })
      .expect(200);

    expect(response.body.data.route.starRating).toBeNull();
  });

  it('should delete all comments left by the deleted user', async () => {
    const comments = await queryRunner.query(
      `SELECT * FROM comment WHERE user_id = '${mockData.users.basicUser1.id}'`,
    );
    expect(comments).toHaveLength(0);
  });

  it('should delete all images uploaded by the deleted user', async () => {
    // Check that uploaded images were deleted from db
    const images = await queryRunner.query(
      `SELECT * FROM image WHERE id IN ('${mockData.toBeDeletedUser.cragImageId}', '${mockData.toBeDeletedUser.routeImageId}')`,
    );
    expect(images).toHaveLength(0);

    // Check that all generated route and crag image files were also removed
    const imagesPath = `${env.STORAGE_PATH}/images`;

    const routeStem = `${mockData.crags.simpleCrag.slug}-${mockData.crags.simpleCrag.sectors.simpleSector1.routes[0].slug}`;
    expect(fs.existsSync(`${imagesPath}/routes/${routeStem}.jpg`)).toBe(false);
    sizes.forEach((size) => {
      const imageStemPath = `${imagesPath}/${size}/routes/${routeStem}`;
      expect(fs.existsSync(`${imageStemPath}.jpg`)).toBe(false);
      expect(fs.existsSync(`${imageStemPath}.webp`)).toBe(false);
      expect(fs.existsSync(`${imageStemPath}.avif`)).toBe(false);
    });

    const cragStem = mockData.crags.simpleCrag.slug;
    expect(fs.existsSync(`${imagesPath}/crags/${cragStem}.jpg`)).toBe(false);
    sizes.forEach((size) => {
      const imageStemPath = `${imagesPath}/${size}/crags/${cragStem}`;
      expect(fs.existsSync(`${imageStemPath}.jpg`)).toBe(false);
      expect(fs.existsSync(`${imageStemPath}.webp`)).toBe(false);
      expect(fs.existsSync(`${imageStemPath}.avif`)).toBe(false);
    });
  });

  it('should delete roles of the deleted user', async () => {
    const roles = await queryRunner.query(
      `SELECT * FROM role WHERE user_id = '${mockData.users.basicUser1.id}'`,
    );
    expect(roles).toHaveLength(0);
  });

  it('should remove the deleted user from a club', async () => {
    const clubMembers = await queryRunner.query(
      `SELECT * FROM club_member WHERE user_id = '${mockData.users.basicUser1.id}'`,
    );
    expect(clubMembers).toHaveLength(0);
  });

  it('should remove all draft contributables that the deleted user contributed', async () => {
    const cragsByUser = await queryRunner.query(
      `SELECT * FROM crag WHERE user_id = '${mockData.users.basicUser1.id}' AND publish_status = 'draft'`,
    );
    expect(cragsByUser).toHaveLength(0);

    const sectorsByUser = await queryRunner.query(
      `SELECT * FROM sector WHERE user_id = '${mockData.users.basicUser1.id}' AND publish_status = 'draft'`,
    );
    expect(sectorsByUser).toHaveLength(0);

    const routesByUser = await queryRunner.query(
      `SELECT * FROM route WHERE user_id = '${mockData.users.basicUser1.id}' AND publish_status = 'draft'`,
    );
    expect(routesByUser).toHaveLength(0);

    // Check that the contributables were actually deleted
    const crags = await queryRunner.query(
      `SELECT * FROM crag WHERE id = '${mockData.crags.draftCrag.id}'`,
    );
    expect(crags).toHaveLength(0);

    const sectors = await queryRunner.query(
      `SELECT * FROM sector WHERE id IN ('${mockData.crags.publishedCrag.sectors.draftSector.id}', '${mockData.crags.draftCrag.sectors.draftSector.id}')`,
    );
    expect(sectors).toHaveLength(0);

    const routes = await queryRunner.query(
      `SELECT * FROM route WHERE id IN ('${mockData.crags.publishedCrag.sectors.draftSector.routes.draftRoute.id}', '${mockData.crags.draftCrag.sectors.draftSector.routes.draftRoute.id}')`,
    );
    expect(routes).toHaveLength(0);
  });

  it('should remove all in_review contributables that the deleted user contributed', async () => {
    const cragsByUser = await queryRunner.query(
      `SELECT * FROM crag WHERE user_id = '${mockData.users.basicUser1.id}' AND publish_status = 'in_review'`,
    );
    expect(cragsByUser).toHaveLength(0);

    const sectorsByUser = await queryRunner.query(
      `SELECT * FROM sector WHERE user_id = '${mockData.users.basicUser1.id}' AND publish_status = 'in_review'`,
    );
    expect(sectorsByUser).toHaveLength(0);

    const routesByUser = await queryRunner.query(
      `SELECT * FROM route WHERE user_id = '${mockData.users.basicUser1.id}' AND publish_status = 'in_review'`,
    );
    expect(routesByUser).toHaveLength(0);

    const crags = await queryRunner.query(
      `SELECT * FROM crag WHERE id = '${mockData.crags.inReviewCrag.id}'`,
    );
    expect(crags).toHaveLength(0);

    const sectors = await queryRunner.query(
      `SELECT * FROM sector WHERE id = '${mockData.crags.inReviewCrag.sectors.inReviewSector.id}'`,
    );
    expect(sectors).toHaveLength(0);

    const routes = await queryRunner.query(
      `SELECT * FROM route WHERE id = '${mockData.crags.inReviewCrag.sectors.inReviewSector.routes.inReviewRoute.id}'`,
    );
    expect(routes).toHaveLength(0);
  });

  it('should unlink user from all published contributables that the deleted user contributed', async () => {
    const cragsByUser = await queryRunner.query(
      `SELECT * FROM crag WHERE user_id = '${mockData.users.basicUser1.id}'`,
    );
    expect(cragsByUser).toHaveLength(0);

    const sectorsByUser = await queryRunner.query(
      `SELECT * FROM sector WHERE user_id = '${mockData.users.basicUser1.id}'`,
    );
    expect(sectorsByUser).toHaveLength(0);

    const routesByUser = await queryRunner.query(
      `SELECT * FROM route WHERE user_id = '${mockData.users.basicUser1.id}'`,
    );
    expect(routesByUser).toHaveLength(0);

    // contributables themselves should be kept, only user disconnected
    const crags = await queryRunner.query(
      `SELECT * FROM crag WHERE id = '${mockData.crags.publishedCrag.id}'`,
    );
    expect(crags).toHaveLength(1);
    expect(crags[0].user_id).toBeNull();

    const sectors = await queryRunner.query(
      `SELECT * FROM sector WHERE id = '${mockData.crags.publishedCrag.sectors.publishedSector.id}'`,
    );
    expect(sectors).toHaveLength(1);
    expect(sectors[0].user_id).toBeNull();

    const routes = await queryRunner.query(
      `SELECT * FROM route WHERE id = '${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.id}'`,
    );
    expect(routes).toHaveLength(1);
    expect(routes[0].user_id).toBeNull();
  });

  it('should unlink user from all route events added by the deleted user', async () => {
    const routeEventsByUser = await queryRunner.query(
      `SELECT * FROM route_event WHERE user_id = '${mockData.users.basicUser1.id}'`,
    );
    expect(routeEventsByUser).toHaveLength(0);

    // route event itself should stay, but user had to be disconnected
    const routeEvents = await queryRunner.query(
      `SELECT * FROM route_event WHERE id = '${mockData.routeEvents.simpleEvent.id}'`,
    );
    expect(routeEvents).toHaveLength(1);
    expect(routeEvents[0].user_id).toBeNull();
  });

  afterAll(async () => {
    await conn.destroy();
    await app.close();
  });
});
