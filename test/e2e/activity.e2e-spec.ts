import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { QueryRunner } from 'typeorm';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { MailService } from '../../src/notification/services/mail.service';
import { initializeDbConn, prepareEnvironment } from './helpers';
import { UsersService } from '../../src/users/services/users.service';
import { UsersModule } from '../../src/users/users.module';
import { CragsModule } from '../../src/crags/crags.module';
import { CragsService } from '../../src/crags/services/crags.service';
import { CountriesService } from '../../src/crags/services/countries.service';
import { CragType } from '../../src/crags/entities/crag.entity';
import { PublishStatus } from '../../src/crags/entities/enums/publish-status.enum';
import { SectorsService } from '../../src/crags/services/sectors.service';
import { RoutesService } from '../../src/crags/services/routes.service';
import {
  AscentType,
  PublishType,
} from '../../src/activities/entities/activity-route.entity';
import {
  Activity,
  ActivityType,
} from '../../src/activities/entities/activity.entity';

describe('Activity', () => {
  let app: NestFastifyApplication;
  let queryRunner: QueryRunner;

  let usersService: UsersService;
  let countryService: CountriesService;
  let cragsService: CragsService;
  let sectorsService: SectorsService;
  let routesService: RoutesService;

  const mockData: any = {
    basicUser: {
      email: 'slavko.majonezic@gmail.com',
      password: '123456789',
      firstname: 'Slavko',
      lastname: 'Majonezić',
    },
    editorUser: {
      email: 'aliba.gundic@gmail.com',
      password: '123456789',
      firstname: 'Aliba',
      lastname: 'Gundič',
    },
  };

  beforeAll(async () => {
    prepareEnvironment();

    const mailService = { send: () => Promise.resolve({}) };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UsersModule, CragsModule],
    })
      .overrideProvider(MailService)
      .useValue(mailService)
      .compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    countryService = moduleRef.get<CountriesService>(CountriesService);
    cragsService = moduleRef.get<CragsService>(CragsService);
    sectorsService = moduleRef.get<SectorsService>(SectorsService);
    routesService = moduleRef.get<RoutesService>(RoutesService);

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

    // Prepare database state

    // register a basic user through the service.
    const basicUser = await usersService.register({
      email: mockData.basicUser.email,
      password: mockData.basicUser.password,
      firstname: mockData.basicUser.firstname,
      lastname: mockData.basicUser.lastname,
    });

    // activate the user (cannot do this through the service...)
    await queryRunner.query(
      `UPDATE public.user SET "isActive" = true WHERE "email" = '${mockData.basicUser.email}'`,
    );

    // register an editor user
    const editorUser = await usersService.register({
      email: mockData.editorUser.email,
      password: mockData.editorUser.password,
      firstname: mockData.editorUser.firstname,
      lastname: mockData.editorUser.lastname,
    });
    mockData.editorUser.id = editorUser.id;

    // activate the user (cannot do this through the service...)
    await queryRunner.query(
      `UPDATE public.user SET "isActive" = true WHERE "email" = '${mockData.editorUser.email}'`,
    );

    // TODO: update query when role admin becomes role editor
    await queryRunner.query(
      `INSERT INTO role ("userId", role) VALUES ('${mockData.editorUser.id}', 'admin')`,
    );

    // Add a country
    const { id: countryId } = await countryService.create({
      code: 'si',
      name: 'Slovenija',
      slug: 'slovenija',
    });

    // Add a grading system
    await queryRunner.query(
      `INSERT INTO grading_system (id, name, position) VALUES ('french', 'French', 100)`,
    );

    // Add a crag
    const crag = await cragsService.create(
      {
        name: 'Bitnje',
        type: CragType.SPORT,
        publishStatus: PublishStatus.PUBLISHED,
        isHidden: false,
        lat: null,
        lon: null,
        countryId: countryId,
        areaId: null,
        description: null,
        access: null,
        orientation: null,
        defaultGradingSystemId: 'french',
      },
      basicUser,
    );
    mockData.crag = crag;

    // Add a sector
    const { id: sectorId } = await sectorsService.create(
      {
        name: 'Prvi sektor',
        label: 'A',
        position: 1,
        publishStatus: PublishStatus.PUBLISHED,
        cragId: mockData.crag.id,
      },
      basicUser,
    );

    // Add a route type
    await queryRunner.query(
      `INSERT INTO route_type (id, name, position) VALUES ('sport', 'sport', 1)`,
    );

    // Add some routes
    mockData.routes = [];
    const route1 = await routesService.create(
      {
        name: 'Prva smer',
        length: 10,
        author: null,
        position: 1,
        publishStatus: PublishStatus.PUBLISHED,
        sectorId,
        isProject: false,
        routeTypeId: 'sport',
        defaultGradingSystemId: 'french',
        baseDifficulty: 200,
      },
      basicUser,
    );
    mockData.routes.push(route1);

    const route2 = await routesService.create(
      {
        name: 'Druga smer',
        length: 10,
        author: null,
        position: 1,
        publishStatus: PublishStatus.PUBLISHED,
        sectorId,
        isProject: false,
        routeTypeId: 'sport',
        defaultGradingSystemId: 'french',
        baseDifficulty: 400,
      },
      basicUser,
    );
    mockData.routes.push(route2);
  });

  it('should fail if adding an activity and not logged in', async () => {
    await request(app.getHttpServer())
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
      .expect(200)
      .then(res => {
        // Unauthorized 401
        expect(res.body.errors[0].extensions.response.statusCode).toBe(401);
      });
  });

  it('should fail if adding an activity with expired auth token', async () => {
    await request(app.getHttpServer())
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
      .expect(200)
      .then(res => {
        // Unauthorized 401
        expect(res.body.errors[0].extensions.exception.status).toBe(401);
      });
  });

  it('should succeed if adding an activity with logged in user', async () => {
    // Login with basic user
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            login(input: { email: "${mockData.basicUser.email}", password: "${mockData.basicUser.password}" }) {
                token
            }
          }
        `,
      })
      .expect(200)
      .then(res => {
        mockData.basicUser.authorizationToken = res.body.data.login.token;
      });

    // add an activity with the logged in user
    let activityId: string;
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.basicUser.authorizationToken}`)
      .send({
        query: `
          mutation {
            createActivity(
              input: {
                date: "2017-03-07"
                name: "test",
                type: "${ActivityType.CRAG}",
                cragId: "${mockData.crag.id}"
              },
              routes: [
                {
                  ascentType: "${AscentType.ONSIGHT}",
                  publish: "${PublishType.PUBLIC}",
                  date: "2017-03-07",                
                  routeId: "${mockData.routes[0].id}"
                }
              ]
            )          
            {
              id
            }
          }
        `,
      })
      .expect(200)
      .then(res => {
        activityId = res.body.data.createActivity.id;
      });

    // Clean up (delete the added activity)
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.basicUser.authorizationToken}`)
      .send({
        query: `
          mutation {
            deleteActivity(
              id: "${activityId}"  
            )                      
          }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data.deleteActivity).toBeTruthy();
      });
  });

  it('should get activities with at least one public activity route and no other activities when fetching as a guest', async () => {
    // add an activity that is not of type crag
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.basicUser.authorizationToken}`)
      .send({
        query: `
          mutation {
            createActivity(
              input: {
                date: "2017-03-08"
                name: "test",
                type: "${ActivityType.CLIMBING_GYM}",
              },
              routes: [              
              ]
            )          
            {
              id
            }
          }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data.createActivity.id).toBeDefined();
      });

    // add an activity that has only private routes
    let privateActivityId: string;
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.basicUser.authorizationToken}`)
      .send({
        query: `
          mutation {
            createActivity(
              input: {
                date: "2017-03-09"
                name: "test",
                type: "${ActivityType.CRAG}",
                cragId: "${mockData.crag.id}"
              },
              routes: [
                {
                  ascentType: "${AscentType.ONSIGHT}",
                  publish: "${PublishType.PRIVATE}",
                  date: "2017-03-07",                
                  routeId: "${mockData.routes[0].id}"
                },
                { 
                  ascentType: "${AscentType.ONSIGHT}",
                  publish: "${PublishType.PRIVATE}",
                  date: "2017-03-07",                
                  routeId: "${mockData.routes[1].id}"
                }
              ]
            )          
            {
              id
            }
          }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res?.body?.data?.createActivity?.id).toBeDefined();
        privateActivityId = res.body.data.createActivity.id;
      });

    // add an activity that has some public routes
    let somePublicRoutesActivityId: string;
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.basicUser.authorizationToken}`)
      .send({
        query: `
        mutation {
          createActivity(
            input: {
              date: "2017-03-10"
              name: "test",
              type: "${ActivityType.CRAG}",
              cragId: "${mockData.crag.id}"
            },
            routes: [
              {
                ascentType: "${AscentType.REPEAT}",
                publish: "${PublishType.PUBLIC}",
                date: "2017-03-07",                
                routeId: "${mockData.routes[0].id}"
              },
              {
                ascentType: "${AscentType.REPEAT}",
                publish: "${PublishType.PRIVATE}",
                date: "2017-03-07",                
                routeId: "${mockData.routes[1].id}"
              }
            ]
          )          
          {
            id
            routes {
              id
            }
          }
        }
      `,
      })
      .expect(200)
      .then(res => {
        expect(res?.body?.data?.createActivity?.id).toBeDefined();
        somePublicRoutesActivityId = res.body.data.createActivity.id;
      });

    // add an activity that has some log routes
    let someLogRoutesActivityId: string;
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.basicUser.authorizationToken}`)
      .send({
        query: `
        mutation {
          createActivity(
            input: {
              date: "2017-03-11"
              name: "test",
              type: "${ActivityType.CRAG}",
              cragId: "${mockData.crag.id}"
            },
            routes: [
              {
                ascentType: "${AscentType.REPEAT}",
                publish: "${PublishType.PRIVATE}",
                date: "2017-03-07",                
                routeId: "${mockData.routes[0].id}"
              },
              {
                ascentType: "${AscentType.REPEAT}",
                publish: "${PublishType.LOG}",
                date: "2017-03-07",                
                routeId: "${mockData.routes[1].id}"
              }
            ]
          )          
          {
            id
          }
        }
      `,
      })
      .expect(200)
      .then(res => {
        expect(res?.body?.data?.createActivity?.id).toBeDefined();
        someLogRoutesActivityId = res.body.data.createActivity.id;
      });

    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `      
          query {
            activities(
              input: {}
            ) {
              items {
                id
                routes 
                  {
                    route {
                      id
                    }
                  }
              }
              meta {
                itemCount
              }
            }
          }
        `,
      })
      .expect(200)
      .then(res => {
        // only two of the activities added above have at least one public route
        expect(res.body.data.activities.meta.itemCount).toBe(2);

        // did we get the right activities based on the containing activity routes?
        const activitiesIds = res.body.data.activities.items.map(
          (a: Activity) => a.id,
        );
        expect(activitiesIds).not.toContain(privateActivityId);
        expect(activitiesIds).toContain(somePublicRoutesActivityId);
        expect(activitiesIds).toContain(someLogRoutesActivityId);

        // only one route in each of the returned activities should be returned
        expect(res.body.data.activities.items[0].routes.length).toBe(1);
        expect(res.body.data.activities.items[1].routes.length).toBe(1);

        // did we get the right activity routes?
        const publicRouteId = res.body.data.activities.items.filter(
          (a: Activity) => a.id === somePublicRoutesActivityId,
        )[0].routes[0].route.id;
        expect(publicRouteId).toBe(mockData.routes[0].id);

        const logRouteId = res.body.data.activities.items.filter(
          (a: Activity) => a.id === someLogRoutesActivityId,
        )[0].routes[0].route.id;
        expect(logRouteId).toBe(mockData.routes[1].id);
      });

    // Clean up (delete the added activities)
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.basicUser.authorizationToken}`)
      .send({
        query: `
        mutation {
          deleteActivity(
            id: "${privateActivityId}"  
          )                      
        }
      `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data.deleteActivity).toBeTruthy();
      });

    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.basicUser.authorizationToken}`)
      .send({
        query: `
        mutation {
          deleteActivity(
            id: "${somePublicRoutesActivityId}"  
          )                      
        }
      `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data.deleteActivity).toBeTruthy();
      });

    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.basicUser.authorizationToken}`)
      .send({
        query: `
        mutation {
          deleteActivity(
            id: "${someLogRoutesActivityId}"  
          )                      
        }
      `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data.deleteActivity).toBeTruthy();
      });
  });

  // TODO:
  // should test all other combinations
  // user logged in, some activities are his some are not
  // user editor and some routes in activities are in_review
  // some activity routes inside activities are hidden
  // ... and so on...

  afterAll(async () => {
    await app.close();
  });
});
