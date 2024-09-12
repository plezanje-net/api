import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { DataSource, QueryRunner } from 'typeorm';
import { MailService } from '../../src/notification/services/mail.service';
import { initializeDbConn, prepareEnvironment, seedDatabase } from './helpers';
import { UsersModule } from '../../src/users/users.module';
import { CragsModule } from '../../src/crags/crags.module';
import { INestApplication } from '@nestjs/common';
import { ActivityType } from '../../src/activities/entities/activity.entity';
import {
  AscentType,
  PublishType,
} from '../../src/activities/entities/activity-route.entity';

describe('Activity', () => {
  let app: INestApplication;
  let conn: DataSource;
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

    app = moduleRef.createNestApplication();

    await app.init();

    conn = await initializeDbConn(app);
    queryRunner = conn.createQueryRunner();

    mockData = await seedDatabase(queryRunner, app);
  });

  it('should set orderScore and rankingScore on ascentRotue when logging an ascent', async () => {
    const mockRoutes = mockData.crags.simpleCrag.sectors.simpleSector1.routes;

    const mutationResponse = await request(app.getHttpServer())
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
                cragId: "${mockData.crags.simpleCrag.id}"
              },
              routes: [
                {
                  ascentType: "${AscentType.ONSIGHT}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[0].id}"
                },
                {
                  ascentType: "${AscentType.FLASH}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[1].id}"
                },
                {
                  ascentType: "${AscentType.REDPOINT}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[2].id}"                
                },
                {
                  ascentType: "${AscentType.REPEAT}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[2].id}"
                }
                {
                  ascentType: "${AscentType.ALLFREE}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[3].id}"
                },
                {
                  ascentType: "${AscentType.AID}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[4].id}"
                },
                {
                  ascentType: "${AscentType.ATTEMPT}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[5].id}"
                },
                {
                  ascentType: "${AscentType.T_ONSIGHT}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[6].id}"
                },
                {
                  ascentType: "${AscentType.T_FLASH}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[7].id}"
                },
                {
                  ascentType: "${AscentType.T_REDPOINT}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[8].id}"
                },
                {
                  ascentType: "${AscentType.T_REPEAT}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[8].id}"
                },
                {
                  ascentType: "${AscentType.T_ALLFREE}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[9].id}"
                },
                {
                  ascentType: "${AscentType.T_AID}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[10].id}"
                }
                {
                  ascentType: "${AscentType.T_ATTEMPT}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",
                  routeId: "${mockRoutes[11].id}"
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

    const activityId = mutationResponse.body.data.createActivity.id;

    const queryResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .send({
        query: `query { 
                  activity(id: "${activityId}") {                    
                    routes {
                      id     
                      ascentType           
                      orderScore  
                      rankingScore
                      route {
                        id
                        difficulty
                      }
                    }
                  }
                }
      `,
      })
      .expect(200);

    // check onsight scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) =>
          r.route.id == mockRoutes[0].id &&
          !(r.ascentType.toLowerCase() == AscentType.REPEAT),
      )[0].orderScore,
    ).toBe(mockRoutes[0].difficulty + 100);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[0].id,
      )[0].rankingScore,
    ).toBe(mockRoutes[0].difficulty + 100);

    // check flash scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[1].id,
      )[0].orderScore,
    ).toBe(mockRoutes[1].difficulty + 50);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[1].id,
      )[0].rankingScore,
    ).toBe(mockRoutes[1].difficulty + 50);

    // check redpoint scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) =>
          r.route.id == mockRoutes[2].id &&
          r.ascentType.toLowerCase() != AscentType.REPEAT,
      )[0].orderScore,
    ).toBe(mockRoutes[2].difficulty);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) =>
          r.route.id == mockRoutes[2].id &&
          r.ascentType.toLowerCase() != AscentType.REPEAT,
      )[0].rankingScore,
    ).toBe(mockRoutes[2].difficulty);

    // check repeat scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) =>
          r.route.id == mockRoutes[2].id &&
          r.ascentType.toLowerCase() == AscentType.REPEAT,
      )[0].orderScore,
    ).toBe(mockRoutes[2].difficulty - 10);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) =>
          r.route.id == mockRoutes[2].id &&
          r.ascentType.toLowerCase() == AscentType.REPEAT,
      )[0].rankingScore,
    ).toBe(0);

    // check allfree scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[3].id,
      )[0].orderScore,
    ).toBe(mockRoutes[3].difficulty * 0.01);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[3].id,
      )[0].rankingScore,
    ).toBe(0);

    // check aid scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[4].id,
      )[0].orderScore,
    ).toBe(mockRoutes[4].difficulty * 0.001);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[4].id,
      )[0].rankingScore,
    ).toBe(0);

    // check attempt scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[5].id,
      )[0].orderScore,
    ).toBe(mockRoutes[5].difficulty * 0.0001);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[5].id,
      )[0].rankingScore,
    ).toBe(0);

    // check tr onsight scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[6].id,
      )[0].orderScore,
    ).toBe((mockRoutes[6].difficulty + 100) * 0.0001);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[6].id,
      )[0].rankingScore,
    ).toBe(0);

    // check tr flash scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[7].id,
      )[0].orderScore,
    ).toBe((mockRoutes[7].difficulty + 50) * 0.0001);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[7].id,
      )[0].rankingScore,
    ).toBe(0);

    // check tr redpoint scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) =>
          r.route.id == mockRoutes[8].id &&
          r.ascentType.toLowerCase() != AscentType.T_REPEAT,
      )[0].orderScore,
    ).toBe(mockRoutes[8].difficulty * 0.0001);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) =>
          r.route.id == mockRoutes[8].id &&
          r.ascentType.toLowerCase() != AscentType.T_REPEAT,
      )[0].rankingScore,
    ).toBe(0);

    // check tr repeat scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) =>
          r.route.id == mockRoutes[8].id &&
          r.ascentType.toLowerCase() == AscentType.T_REPEAT,
      )[0].orderScore,
    ).toBe((mockRoutes[8].difficulty - 10) * 0.0001);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) =>
          r.route.id == mockRoutes[8].id &&
          r.ascentType.toLowerCase() == AscentType.T_REPEAT,
      )[0].rankingScore,
    ).toBe(0);

    // check tr allfree scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[9].id,
      )[0].orderScore,
    ).toBe(mockRoutes[9].difficulty * 0.01 * 0.0001);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[9].id,
      )[0].rankingScore,
    ).toBe(0);

    // check tr aid scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[10].id,
      )[0].orderScore,
    ).toBe(mockRoutes[10].difficulty * 0.001 * 0.0001);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[10].id,
      )[0].rankingScore,
    ).toBe(0);

    // check tr attempt scores
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[11].id,
      )[0].orderScore,
    ).toBe(mockRoutes[11].difficulty * 0.0001 * 0.0001);
    expect(
      queryResponse.body.data.activity.routes.filter(
        (r) => r.route.id == mockRoutes[11].id,
      )[0].rankingScore,
    ).toBe(0);
  });

  afterAll(async () => {
    await conn.destroy();
    await app.close();
  });
});
