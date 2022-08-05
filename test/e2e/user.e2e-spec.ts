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

describe('User', () => {
  let app: NestFastifyApplication;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    prepareEnvironment();

    const mailService = { send: () => Promise.resolve({}) };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
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
  });

  const mockData: any = {
    id: null,
    confirmationToken: null,
    authorizationToken: null,
    passwordToken: null,
    email: 'test@test.com',
    password: 'Test',
    firstname: 'Janez',
    lastname: 'Testnik',
  };

  it(`should not return profile without auth`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
            query {
                profile {
                    id
                }
            }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data).toBe(null);
      });
  });

  it(`should not succeed by logging in with unexisting user`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
            mutation {
                login(input: { email: "${mockData.email}", password: "${mockData.password}" }) {
                    token
                }
            }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data).toBe(null);
      });
  });

  it(`should register new user`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
            mutation {
                register(input: { email: "${mockData.email}", password: "${mockData.password}", firstname: "${mockData.firstname}", lastname: "${mockData.lastname}" })
            }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data.register).toBe(true);
      });

    const user = await queryRunner.query(
      `SELECT * FROM public.user WHERE email = '${mockData.email}'`,
    );
    mockData.userId = user[0].id;
    mockData.confirmationToken = user[0].confirmationToken;
  });

  it(`should not allow duplicate emails`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
            mutation {
                register(input: { email: "${mockData.email}", password: "${mockData.password}", firstname: "${mockData.firstname}", lastname: "${mockData.lastname}" })
            }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data).toBe(null);
        expect(res.body.errors.length).toBeGreaterThan(0);
      });
  });

  it(`should fail on invalid confirmation token`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
            mutation {
                confirm(input: { id: "${mockData.userId}", token: "invalid_token" })
            }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data).toBe(null);
        expect(res.body.errors.length).toBeGreaterThan(0);
      });
  });

  it(`should succeed on valid confirmation token`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
            mutation {
                confirm(input: { id: "${mockData.userId}", token: "${mockData.confirmationToken}" })
            }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data.confirm).toBe(true);
      });
  });

  it(`should sign in the new user`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            login(input: { email: "${mockData.email}", password: "${mockData.password}" }) {
                token
            }
          }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data.login.token).toBeDefined();
        mockData.authorizationToken = res.body.data.login.token;
      });
  });

  it(`should return profile for the new user`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.authorizationToken}`)
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
      .expect(200)
      .then(res => {
        expect(res.body.data.profile.id).toBe(mockData.userId);
        expect(res.body.data.profile.firstname).toBe(mockData.firstname);
        expect(res.body.data.profile.lastname).toBe(mockData.lastname);
      });
  });

  it(`should not recover on unexisting email`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            recover(email: "t-${mockData.email}")
          }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data).toBe(null);
      });
  });

  it(`should initialize password recovery`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            recover(email: "${mockData.email}")
          }
        `,
      })
      .expect(200)
      .then(async res => {
        expect(res.body.data.recover).toBe(true);
        const user = await queryRunner.query(
          `SELECT * FROM public.user WHERE email = '${mockData.email}'`,
        );
        mockData.passwordToken = user[0].passwordToken;
      });
  });

  it(`should save the new password`, async () => {
    mockData.password = 'ChangedPassword';
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            setPassword(input: { id: "${mockData.userId}", token: "${mockData.passwordToken}", password: "${mockData.password}" })
          }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data.setPassword).toBe(true);
      });
  });

  it(`should not return profile with the previous token`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.authorizationToken}`)
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
      .expect(200)
      .then(res => {
        expect(res.body.data).toBe(null);
      });
  });

  it(`should sign in with the changed password`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            login(input: { email: "${mockData.email}", password: "${mockData.password}" }) {
                token
            }
          }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data.login.token).toBeDefined();
        mockData.authorizationToken = res.body.data.login.token;
      });
  });

  afterAll(async () => {
    // not very nice, but it does the trick because db connection is still running somehow
    // setTimeout(async () => {
    //   await app.close();
    // }, 100);

    await app.close();
  });
});
