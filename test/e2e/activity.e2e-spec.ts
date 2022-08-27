import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { QueryRunner } from 'typeorm';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { MailService } from '../../src/notification/services/mail.service';
import { initializeDbConn, prepareEnvironment, seedDatabase } from './helpers';
import { UsersModule } from '../../src/users/users.module';
import { CragsModule } from '../../src/crags/crags.module';
import { AscentType } from '../../src/activities/entities/activity-route.entity';
import {
  Activity,
  ActivityType,
} from '../../src/activities/entities/activity.entity';

describe('Activity', () => {
  let app: NestFastifyApplication;
  let queryRunner: QueryRunner;

  let mockData: any;

  beforeAll(async () => {
    prepareEnvironment();

    const mailService = { send: () => Promise.resolve({}) };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UsersModule, CragsModule],
    })
      .overrideProvider(MailService)
      .useValue(mailService)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app
      .getHttpAdapter()
      .getInstance()
      .ready();

    const conn = await initializeDbConn(app);
    queryRunner = conn.createQueryRunner();

    mockData = await seedDatabase(queryRunner, app);

    // Add to db state some more data specific to this test; that is, add some activities
    mockData.activities = {
      nonCragActivity: {
        id: '85853921-9e23-4351-8c20-eeb74bb0f26b',
      },
      activityWithPublicRoutes: {
        id: '85853921-9e23-4351-8c20-eeb74bb0f26c',
        activityRoutes: {
          publicActivityRoute: {
            id: '85853921-9e23-4351-8c20-eeb74bb0f26d',
          },
        },
      },
      activityWithPrivateRoutes: {
        id: '85853921-9e23-4351-8c20-eeb74bb0f26e',
        activityRoutes: {
          privateActivityRoute: {
            id: '85853921-9e23-4351-8c20-eeb74bb0f26f',
          },
        },
      },
      activityWithLogRoutes: {
        id: '6fdbee7d-0db6-430f-ab60-a49bd4dbd602',
        activityRoutes: {
          logActivityRoute: {
            id: 'f48018bb-d9cd-425b-ab68-95954e3b09ef',
          },
        },
      },
      acitivityWithClubRoutes: {
        // TODO: implement this test when BE includes these activities
      },
      activityWithMixedRoutes: {
        id: '55798afa-4777-4a33-bafa-329a27a4480c',
        activityRoutes: {
          publicActivityRoute: {
            id: 'f6227ef9-a8c8-410b-9df4-8b326d41ef95',
          },
          logActivityRoute: {
            id: '180b0705-6217-4369-b37d-2ee28964bfb1',
          },
          privateActivityRoute: {
            id: '00310785-8227-49e1-aba8-1b0d84530ab6',
          },
        },
      },
      // publish status based
      activityInDraftCrag: {
        id: 'b8837d73-4bc2-4b3b-87fd-72345aa67376',
        activityRoutes: {
          activityRoute1: {
            id: 'dee30188-99f7-44e9-aa70-ae24c3d6e4fd',
          },
        },
      },
      activityInInReviewCrag: {
        id: '3cb1ffdd-bbdf-45b6-9d54-f632bd77bbfa',
        activityRoutes: {
          activityRoute1: {
            id: 'bbf61242-cda6-40ad-a0dd-87f1124868a4',
          },
        },
      },
      activityInPublishedCragDraftSector: {
        id: '747a57f9-d2dc-4665-a3f7-97b1fd2e1d5c',
        activityRoutes: {
          activityRoute1: {
            id: '69fcd29c-fe07-4a78-8f1c-1127acf79df1',
          },
        },
      },
    };

    await queryRunner.query(
      `INSERT INTO activity (id, type, name, date, "userId")
      VALUES ('${mockData.activities.nonCragActivity.id}', '${ActivityType.CLIMBING_GYM}', 'Activity 1', '2001-01-01', '${mockData.users.basicUser1.id}')`,
    );

    // add activity with only public routes
    await queryRunner.query(
      `INSERT INTO activity (id, type, name, date, "userId", "cragId")
      VALUES ('${mockData.activities.activityWithPublicRoutes.id}', '${ActivityType.CRAG}', 'Activity 2', '2001-01-02', '${mockData.users.basicUser1.id}', '${mockData.crags.publishedCrag.id}')`,
    );

    await queryRunner.query(
      `INSERT INTO activity_route (id, "ascentType", publish, "activityId", "routeId", "userId")
      VALUES ('${mockData.activities.activityWithPublicRoutes.activityRoutes.publicActivityRoute.id}', '${AscentType.ONSIGHT}', 'public', '${mockData.activities.activityWithPublicRoutes.id}', '${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.id}', '${mockData.users.basicUser1.id}')`,
    );

    // add activity with only private activity routes
    await queryRunner.query(
      `INSERT INTO activity (id, type, name, date, "userId", "cragId")
      VALUES ('${mockData.activities.activityWithPrivateRoutes.id}', '${ActivityType.CRAG}', 'Activity 3', '2001-01-03', '${mockData.users.basicUser1.id}', '${mockData.crags.publishedCrag.id}')`,
    );

    await queryRunner.query(
      `INSERT INTO activity_route (id, "ascentType", publish, "activityId", "routeId", "userId")
      VALUES ('${mockData.activities.activityWithPrivateRoutes.activityRoutes.privateActivityRoute.id}', '${AscentType.REPEAT}', 'private', '${mockData.activities.activityWithPrivateRoutes.id}', '${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.id}', '${mockData.users.basicUser1.id}')`,
    );

    // add activity with only log activity routes
    await queryRunner.query(
      `INSERT INTO activity (id, type, name, date, "userId", "cragId")
      VALUES ('${mockData.activities.activityWithLogRoutes.id}', '${ActivityType.CRAG}', 'Activity 4', '2001-01-04', '${mockData.users.basicUser1.id}', '${mockData.crags.publishedCrag.id}')`,
    );

    await queryRunner.query(
      `INSERT INTO activity_route (id, "ascentType", publish, "activityId", "routeId", "userId")
      VALUES ('${mockData.activities.activityWithLogRoutes.activityRoutes.logActivityRoute.id}', '${AscentType.REPEAT}', 'log', '${mockData.activities.activityWithLogRoutes.id}', '${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.id}', '${mockData.users.basicUser1.id}')`,
    );

    // add activty with mixed activity routes (public, private, log)
    await queryRunner.query(
      `INSERT INTO activity (id, type, name, date, "userId", "cragId")
      VALUES ('${mockData.activities.activityWithMixedRoutes.id}', '${ActivityType.CRAG}', 'Activity 5', '2001-01-05', '${mockData.users.basicUser1.id}', '${mockData.crags.publishedCrag.id}')`,
    );

    await queryRunner.query(
      `INSERT INTO activity_route (id, "ascentType", publish, "activityId", "routeId", "userId")
      VALUES ('${mockData.activities.activityWithMixedRoutes.activityRoutes.publicActivityRoute.id}', '${AscentType.REPEAT}', 'public', '${mockData.activities.activityWithMixedRoutes.id}', '${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.id}', '${mockData.users.basicUser1.id}')`,
    );
    await queryRunner.query(
      `INSERT INTO activity_route (id, "ascentType", publish, "activityId", "routeId", "userId")
      VALUES ('${mockData.activities.activityWithMixedRoutes.activityRoutes.logActivityRoute.id}', '${AscentType.REPEAT}', 'log', '${mockData.activities.activityWithMixedRoutes.id}', '${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.id}', '${mockData.users.basicUser1.id}')`,
    );
    await queryRunner.query(
      `INSERT INTO activity_route (id, "ascentType", publish, "activityId", "routeId", "userId")
      VALUES ('${mockData.activities.activityWithMixedRoutes.activityRoutes.privateActivityRoute.id}', '${AscentType.REPEAT}', 'private', '${mockData.activities.activityWithMixedRoutes.id}', '${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.id}', '${mockData.users.basicUser1.id}')`,
    );

    // add activity in a draft crag
    await queryRunner.query(
      `INSERT INTO activity (id, type, name, date, "userId", "cragId")
      VALUES ('${mockData.activities.activityInDraftCrag.id}', '${ActivityType.CRAG}', 'Activity 6', '2001-01-06', '${mockData.users.basicUser1.id}', '${mockData.crags.draftCrag.id}')`,
    );
    await queryRunner.query(
      `INSERT INTO activity_route (id, "ascentType", publish, "activityId", "routeId", "userId")
      VALUES ('${mockData.activities.activityInDraftCrag.activityRoutes.activityRoute1.id}', '${AscentType.REPEAT}', 'public', '${mockData.activities.activityInDraftCrag.id}', '${mockData.crags.draftCrag.sectors.draftSector.routes.draftRoute.id}', '${mockData.users.basicUser1.id}')`,
    );

    // add activity in an in_review crag
    await queryRunner.query(
      `INSERT INTO activity (id, type, name, date, "userId", "cragId")
      VALUES ('${mockData.activities.activityInInReviewCrag.id}', '${ActivityType.CRAG}', 'Activity 7', '2001-01-07', '${mockData.users.basicUser1.id}', '${mockData.crags.inReviewCrag.id}')`,
    );
    await queryRunner.query(
      `INSERT INTO activity_route (id, "ascentType", publish, "activityId", "routeId", "userId")
      VALUES ('${mockData.activities.activityInInReviewCrag.activityRoutes.activityRoute1.id}', '${AscentType.REPEAT}', 'public', '${mockData.activities.activityInInReviewCrag.id}', '${mockData.crags.inReviewCrag.sectors.inReviewSector.routes.inReviewRoute.id}', '${mockData.users.basicUser1.id}')`,
    );

    // add activity in a published crag and draft sector
    await queryRunner.query(
      `INSERT INTO activity (id, type, name, date, "userId", "cragId")
      VALUES ('${mockData.activities.activityInPublishedCragDraftSector.id}', '${ActivityType.CRAG}', 'Activity 8', '2001-01-08', '${mockData.users.basicUser1.id}', '${mockData.crags.publishedCrag.id}')`,
    );
    await queryRunner.query(
      `INSERT INTO activity_route (id, "ascentType", publish, "activityId", "routeId", "userId")
      VALUES ('${mockData.activities.activityInPublishedCragDraftSector.activityRoutes.activityRoute1.id}', '${AscentType.REPEAT}', 'public', '${mockData.activities.activityInPublishedCragDraftSector.id}', '${mockData.crags.publishedCrag.sectors.draftSector.routes.draftRoute.id}', '${mockData.users.basicUser1.id}')`,
    );
  });

  it("should fail to get activities that are not of type 'crag' when not logged in", async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id                
              }              
            }
          }
        `,
      })
      .expect(200);

    const activitiesIds = response.body.data.activities.items.map(
      (a: Activity) => a.id,
    );
    expect(activitiesIds).not.toContain(mockData.activities.nonCragActivity.id);
  });

  it("should succeed to get activities of type other than 'crag' if fetched by activity owner", async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id              
              }            
            }
          }
        `,
      })
      .expect(200);

    const activitiesIds = response.body.data.activities.items.map(
      (a: Activity) => a.id,
    );
    expect(activitiesIds).toContain(mockData.activities.nonCragActivity.id);
  });

  it("should fail to get activities that are not of type 'crag' and are not owned by the logged in user", async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.basicUser2.authToken}`)
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id              
              }            
            }
          }
        `,
      })
      .expect(200);

    const activitiesIds = response.body.data.activities.items.map(
      (a: Activity) => a.id,
    );
    expect(activitiesIds).not.toContain(mockData.activities.nonCragActivity.id);
  });

  it('should get only public (or log) activity routes and only activities containing at least one public (or log) activity route when fetching as a guest', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id
                routes(input: {}) {
                  id
                  route {
                    id
                  }
                  publish
                }
              }            
            }
          }
        `,
      })
      .expect(200);

    const numOfNonPublicActivityRoutes = response.body.data.activities.items.filter(
      a =>
        a.routes.filter(ar => !['log', 'public'].includes(ar.publish)).length >
        0,
    ).length;
    expect(numOfNonPublicActivityRoutes).toEqual(0);

    const numOfActivitiesWithNoPublicActivityRoutes = response.body.data.activities.items.filter(
      a => !a.routes.some(ar => ['log', 'public'].includes(ar.publish)),
    ).length;
    expect(numOfActivitiesWithNoPublicActivityRoutes).toEqual(0);

    // TODO: should I test as above (fetching publish and comparing it), or should I only test id's of ars that I know should or should not be returned???
    // the hard code way:
    const returnedActivitiesIds = response.body.data.activities.items.map(
      a => a.id,
    );
    expect(returnedActivitiesIds).toContain(
      mockData.activities.activityWithLogRoutes.id,
    );
    expect(returnedActivitiesIds).toContain(
      mockData.activities.activityWithPublicRoutes.id,
    );
    expect(returnedActivitiesIds).toContain(
      mockData.activities.activityWithMixedRoutes.id,
    );
    expect(returnedActivitiesIds).not.toContain(
      mockData.activities.activityWithPrivateRoutes.id,
    );

    const returnedActivityRoutesIds = response.body.data.activities.items
      .map(a => a.routes.map(ar => ar.id))
      .reduce((acc, curr) => acc.concat(curr), []);
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityWithPublicRoutes.activityRoutes
        .publicActivityRoute.id,
    );
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityWithLogRoutes.activityRoutes.logActivityRoute
        .id,
    );
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityWithMixedRoutes.activityRoutes
        .publicActivityRoute.id,
    );
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityWithMixedRoutes.activityRoutes
        .logActivityRoute.id,
    );
    expect(returnedActivityRoutesIds).not.toContain(
      mockData.activities.activityWithPrivateRoutes.activityRoutes
        .privateActivityRoute.id,
    );
    expect(returnedActivityRoutesIds).not.toContain(
      mockData.activities.activityWithMixedRoutes.activityRoutes
        .privateActivityRoute.id,
    );
    // console.log(JSON.stringify(response.body.data.activities.items, null, 4));
  });

  it("should get all public (or log) and all user's own activities when fetching with a logged in user", async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id
                user {
                  id
                }
                routes(input: {}) {
                  id
                  route {
                    id
                  }
                  publish
                  user {
                    id
                  }
                }
              }            
            }
          }
        `,
      })
      .expect(200);

    // check that none of the got activities are not public and from another user
    response.body.data.activities.items
      .filter(
        a =>
          a.routes.filter(ar => !['log', 'public'].includes(ar.publish))
            .length > 0 || a.routes.length === 0,
      )
      .forEach(a => {
        expect(a.user.id).toBe(mockData.users.basicUser1.id);
      });

    // check that all of the activities from the logged in user are got
    const returnedActivityIds = response.body.data.activities.items.map(
      a => a.id,
    );
    expect(returnedActivityIds).toContain(
      mockData.activities.activityWithPublicRoutes.id,
    );
    expect(returnedActivityIds).toContain(
      mockData.activities.activityWithLogRoutes.id,
    );
    expect(returnedActivityIds).toContain(
      mockData.activities.nonCragActivity.id,
    );
    expect(returnedActivityIds).toContain(
      mockData.activities.activityWithPrivateRoutes.id,
    );

    // check that all the activity routes from the logged in user are got
    const returnedActivityRoutesIds = response.body.data.activities.items
      .map(a => a.routes.map(ar => ar.id))
      .reduce((acc, curr) => acc.concat(curr), []);
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityWithPublicRoutes.activityRoutes
        .publicActivityRoute.id,
    );
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityWithLogRoutes.activityRoutes.logActivityRoute
        .id,
    );
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityWithPrivateRoutes.activityRoutes
        .privateActivityRoute.id,
    );
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityWithMixedRoutes.activityRoutes
        .publicActivityRoute.id,
    );
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityWithMixedRoutes.activityRoutes
        .logActivityRoute.id,
    );
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityWithMixedRoutes.activityRoutes
        .privateActivityRoute.id,
    );
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityWithPrivateRoutes.activityRoutes
        .privateActivityRoute.id,
    );
  });

  it('should fail to get activities in a crag that is not published if not logged in', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id
              }
            }
          }
        `,
      })
      .expect(200);

    const returnedActivityIds = response.body.data.activities.items.map(
      a => a.id,
    );
    expect(returnedActivityIds).not.toContain(
      mockData.activities.activityInDraftCrag.id,
    );
    expect(returnedActivityIds).not.toContain(
      mockData.activities.activityInInReviewCrag.id,
    );
  });

  it('should get activities in a crag that is a draft if logged in user is the owner of the draft', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id
                routes(input: {}) {
                  id
                }
              }
            }
          }
        `,
      })
      .expect(200);

    const returnedActivityIds = response.body.data.activities.items.map(
      a => a.id,
    );
    expect(returnedActivityIds).toContain(
      mockData.activities.activityInDraftCrag.id,
    );

    const returnedActivityRoutesIds = response.body.data.activities.items
      .map(a => a.routes.map(ar => ar.id))
      .reduce((acc, curr) => acc.concat(curr), []);
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityInDraftCrag.activityRoutes.activityRoute1.id,
    );
  });

  it('should fail to get activities in a crag that is a draft if logged in with a user that is not the owner of the crag draft', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.basicUser2.authToken}`)
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id
              }
            }
          }
        `,
      })
      .expect(200);

    const returnedActivityIds = response.body.data.activities.items.map(
      a => a.id,
    );
    expect(returnedActivityIds).not.toContain(
      mockData.activities.activityInDraftCrag.id,
    );
  });

  it('should fail to get activities in a crag that is in status in_review if not logged in', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id
              }
            }
          }
        `,
      })
      .expect(200);

    const returnedActivityIds = response.body.data.activities.items.map(
      a => a.id,
    );
    expect(returnedActivityIds).not.toContain(
      mockData.activities.activityInInReviewCrag.id,
    );
  });

  it('should fail to get activities in a crag that is in status in_review and logged in with a user that is not an editor nor the owner of the crag', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.basicUser2.authToken}`)
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id
              }
            }
          }
        `,
      })
      .expect(200);

    const returnedActivityIds = response.body.data.activities.items.map(
      a => a.id,
    );
    expect(returnedActivityIds).not.toContain(
      mockData.activities.activityInInReviewCrag.id,
    );
  });

  it('should get activities in a crag that is in status in_review if logged in with a user that is an editor', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.editorUser.authToken}`)
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id
                routes {
                  id
                }
              }
            }
          }
        `,
      })
      .expect(200);

    const returnedActivityIds = response.body.data.activities.items.map(
      a => a.id,
    );
    expect(returnedActivityIds).toContain(
      mockData.activities.activityInInReviewCrag.id,
    );

    const returnedActivityRoutesIds = response.body.data.activities.items
      .map(a => a.routes.map(ar => ar.id))
      .reduce((acc, curr) => acc.concat(curr), []);
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityInInReviewCrag.activityRoutes.activityRoute1
        .id,
    );
  });

  it('should fail to get activities in a draft sector of a published crag if not logged in', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id
              }
            }
          }
        `,
      })
      .expect(200);

    const returnedActivityIds = response.body.data.activities.items.map(
      a => a.id,
    );
    expect(returnedActivityIds).not.toContain(
      mockData.activities.activityInPublishedCragDraftSector.id,
    );
  });

  it('should fail to get activities in a draft sector of a published crag if logged in with a user that is not the owner of the draft sector', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.editorUser.authToken}`)
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id
              }
            }
          }
        `,
      })
      .expect(200);

    const returnedActivityIds = response.body.data.activities.items.map(
      a => a.id,
    );
    expect(returnedActivityIds).not.toContain(
      mockData.activities.activityInPublishedCragDraftSector.id,
    );
  });

  it('should get activities in a draft sector of a published crag if logged in with a user that is the owner of the draft sector', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .send({
        query: `
          query {
            activities(
              input: {}
            ) {
              items {
                id
                routes {
                  id
                }
              }
            }
          }
        `,
      })
      .expect(200);

    const returnedActivityIds = response.body.data.activities.items.map(
      a => a.id,
    );
    expect(returnedActivityIds).toContain(
      mockData.activities.activityInPublishedCragDraftSector.id,
    );

    const returnedActivityRoutesIds = response.body.data.activities.items
      .map(a => a.routes.map(ar => ar.id))
      .reduce((acc, curr) => acc.concat(curr), []);
    expect(returnedActivityRoutesIds).toContain(
      mockData.activities.activityInPublishedCragDraftSector.activityRoutes
        .activityRoute1.id,
    );
  });

  // TODO:
  // should test more combinations
  // user logged in, some activities are his some are not
  // user editor and some routes in activities are in_review
  // some activity routes inside activities are hidden
  // activities in a crag that is hidden
  // clubs when done on be
  // ... and more? ...

  afterAll(async () => {
    await app.close();
  });
});
