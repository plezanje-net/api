import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Connection, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { MailService } from '../src/notification/services/mail.service';

describe('User', () => {
  let app: NestFastifyApplication;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    process.env.DB_PORT = '5434';

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

    const conn = app.get(Connection);

    const query = fs.readFileSync('./test/sql/init.sql', 'utf8');

    queryRunner = conn.createQueryRunner();

    await queryRunner.query(query);
    await conn.synchronize(true);
  });

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
                login(input: { email: "test@test.com", password: "Test" }) {
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

  let userId: string;
  let confirmationToken: string;

  it(`should register new user`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
            mutation {
                register(input: { email: "test@test.com", password: "Test", firstname: "Test", lastname: "Test" })
            }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data.register).toBe(true);
      });

    const user = await queryRunner.query(
      `SELECT * FROM public.user WHERE email = 'test@test.com'`,
    );
    userId = user[0].id;
    confirmationToken = user[0].confirmationToken;
  });

  it(`should not allow duplicate emails`, async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
            mutation {
                register(input: { email: "test@test.com", password: "Test", firstname: "Test", lastname: "Test" })
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
                confirm(input: { id: "${userId}", token: "invalid_token" })
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
                confirm(input: { id: "${userId}", token: "${confirmationToken}" })
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
            login(input: { email: "test@test.com", password: "Test" }) {
                token
            }
          }
        `,
      })
      .expect(200)
      .then(res => {
        expect(res.body.data.login.token).toBeDefined();
      });
  });

  afterAll(async () => {
    // not very nice, but it does the trick because db connection is still running somehow
    setTimeout(async () => {
      await app.close();
    }, 100);
  });
});
