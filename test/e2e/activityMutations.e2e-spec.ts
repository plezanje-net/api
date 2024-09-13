import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { CragsModule } from '../../src/crags/crags.module';
import { UsersModule } from '../../src/users/users.module';
import { initializeDbConn, prepareEnvironment, seedDatabase } from './helpers';
import { ActivityType } from '../../src/activities/entities/activity.entity';
import {
  AscentType,
  PublishType,
} from '../../src/activities/entities/activity-route.entity';

describe('ActivityMutations', () => {
  let app: INestApplication;
  let conn: DataSource;
  let queryRunner: QueryRunner;

  let mockData: any;

  beforeAll(async () => {
    prepareEnvironment();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UsersModule, CragsModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();

    conn = await initializeDbConn(app);
    queryRunner = conn.createQueryRunner();

    mockData = await seedDatabase(queryRunner, app);
  });

  it('should fail if adding an activity and not logged in', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
        mutation {
          createActivity(input: {
              type: "crag",
              name: "test",
              date: "2017-03-07"
            }, routes: [])
          {
            id
          }
        }
      `,
      })
      .expect(200);

    // Unauthorized 401
    expect(response.body.errors[0].extensions.response.statusCode).toBe(401);
  });

  it('should fail if adding an activity with expired auth token', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set(
        'Authorization',
        `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0ODM3ZmNhNC0yZmFjLTQ4MWYtYWY5ZS1iOGUyNDcwNmY4Y2MiLCJlbWFpbCI6InNsYXZrby5tYWpvbmV6aWNAZ21haWwuY29tIiwibGFzdFBhc3N3b3JkQ2hhbmdlIjoiMjAyMi0wNi0xN1QwODowMTowNy4yMTdaIiwicm9sZXMiOltdLCJpYXQiOjE2NTcyOTkyOTEsImV4cCI6MTY1OTg5MTI5MX0.TeYxQfXSrNqCBHy5sTWhr7PYAxgD98djMmu9lmo0WJI`,
      )
      .send({
        query: `
          mutation {
            createActivity(input: {
                type: "crag",
                name: "test",
                date: "2017-03-07"
              }, routes: [])
            {
              id
            }
          }
        `,
      })
      .expect(200);

    // Unauthorized 401
    expect(response.body.errors[0].extensions.exception.status).toBe(401);
  });

  it('should succeed if adding an activity with logged in user', async () => {
    // Add an activity with the logged in user
    let activityId: string;
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .send({
        query: `
          mutation {
            createActivity(
              input: {
                date: "2017-03-07"
                name: "test",
                type: "${ActivityType.CRAG}",
                cragId: "${mockData.crags.publishedCrag.id}"
              },
              routes: [
                {
                  ascentType: "${AscentType.onsight}",
                  publish: "${PublishType.public}",
                  date: "2017-03-07",
                  routeId: "${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.id}"
                }
              ]
            )
            {
              id
            }
          }
        `,
      })
      .expect(200);

    mockData.activities = {
      cragActivity: {
        id: response.body.data.createActivity.id,
      },
    };
  });

  it('should fail if trying to delete activity and not logged in', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
    mutation {
      deleteActivity(
        id: "${mockData.activities.cragActivity.id}"
        )
      }
      `,
      })
      .expect(200);

    expect(response.body.errors[0].extensions.response.statusCode).toBe(401);
  });

  it('should fail if trying to delete activity and logged in with a user that is not the owner of the activity', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.basicUser2.authToken}`)
      .send({
        query: `
    mutation {
      deleteActivity(
        id: "${mockData.activities.cragActivity.id}"
        )
      }
      `,
      })
      .expect(200);

    // 403 Forbidden
    expect(response.body.errors[0].extensions.response.statusCode).toBe(403);
  });

  it('should succeed if deleting the activity and logged in as the owner of the activity', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .send({
        query: `
    mutation {
      deleteActivity(
        id: "${mockData.activities.cragActivity.id}"
        )
      }
      `,
      })
      .expect(200);

    expect(response.body.data.deleteActivity).toBeTruthy();
  });

  // TODO: add tests of update mutations
  // TODO: add tests of dryrun mutations?

  afterAll(async () => {
    await conn.destroy();
    await app.close();
  });
});
