import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { DataSource, QueryRunner } from 'typeorm';
import { MailService } from '../../src/notification/services/mail.service';
import { initializeDbConn, prepareEnvironment, seedDatabase } from './helpers';
import { INestApplication } from '@nestjs/common';
import { CragsModule } from '../../src/crags/crags.module';
import { ActivityType } from '../../src/activities/entities/activity.entity';
import { AscentType } from '../../src/activities/entities/activity-route.entity';

describe('SectorMigration', () => {
  let app: INestApplication;
  let conn: DataSource;
  let queryRunner: QueryRunner;

  let mockData: any;

  beforeAll(async () => {
    prepareEnvironment();

    const mailService = { send: () => Promise.resolve({}) };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CragsModule],
    })
      .overrideProvider(MailService)
      .useValue(mailService)
      .compile();

    app = moduleRef.createNestApplication();

    await app.init();

    conn = await initializeDbConn(app);
    queryRunner = conn.createQueryRunner();

    mockData = await seedDatabase(queryRunner, app);
    mockData.activities = {
      activityAcrossSectors: {
        id: '85853921-9e23-4351-8c20-eeb74bb0f26c',
      },
    };

    await queryRunner.query(
      `INSERT INTO activity (id, crag_id, type, name, date, user_id)
      VALUES ('${mockData.activities.activityAcrossSectors.id}', '${mockData.crags.cragWithMultipleSectors.id}', '${ActivityType.CRAG}', 'Activity to be split', '2001-01-01', '${mockData.users.basicUser1.id}')`,
    );
    await queryRunner.query(
      `INSERT INTO activity_route (ascent_type, publish, activity_id, route_id, user_id, order_score, ranking_score)
      VALUES 
        ('${AscentType.allfree}', 'log', '${mockData.activities.activityAcrossSectors.id}', '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}', '${mockData.users.basicUser1.id}', 1000, 1000),
        ('${AscentType.allfree}', 'log', '${mockData.activities.activityAcrossSectors.id}', '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.secondRoute.id}', '${mockData.users.basicUser1.id}', 1000, 1000),
        ('${AscentType.allfree}', 'log', '${mockData.activities.activityAcrossSectors.id}', '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.id}', '${mockData.users.basicUser1.id}', 1000, 1000),
        ('${AscentType.allfree}', 'log', '${mockData.activities.activityAcrossSectors.id}', '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.secondRoute.id}', '${mockData.users.basicUser1.id}', 1000, 1000)
      `,
    );
  });

  it('should move the sector to the new crag', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.editorUser.authToken}`)
      .send({
        query: `
        mutation {
          moveSectorToCrag(id: "${mockData.crags.cragWithMultipleSectors.sectors.secondSector.id}", cragId: "${mockData.crags.publishedCrag.id}")
        }
      `,
      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    const sectors = await queryRunner.query(
      `SELECT * FROM sector WHERE crag_id = '${mockData.crags.cragWithMultipleSectors.id}'`,
    );
    expect(sectors.length).toBe(1);
  });

  it('should create activity and link activity routes linked to the new crag', async () => {
    const activityRoutes = await queryRunner.query(
      `SELECT * FROM activity_route WHERE activity_id = '${mockData.activities.activityAcrossSectors.id}'`,
    );
    expect(activityRoutes.length).toBe(2);
  });

  it('should not delete previous activity if there are still activity routes link to the old crag', async () => {
    const activity = await queryRunner.query(
      `SELECT * FROM activity WHERE id = '${mockData.activities.activityAcrossSectors.id}'`,
    );
    expect(activity.length).toBe(1);
  });

  it('should delete previous activity if all activity routes have been moved to another crag', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.editorUser.authToken}`)
      .send({
        query: `
        mutation {
          moveSectorToCrag(id: "${mockData.crags.cragWithMultipleSectors.sectors.firstSector.id}", cragId: "${mockData.crags.publishedCrag.id}")
        }
      `,
      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();

    const activityRoutes = await queryRunner.query(
      `SELECT * FROM activity_route WHERE activity_id = '${mockData.activities.activityAcrossSectors.id}'`,
    );
    expect(activityRoutes.length).toBe(0);

    const activity = await queryRunner.query(
      `SELECT * FROM activity WHERE id = '${mockData.activities.activityAcrossSectors.id}'`,
    );
    expect(activity.length).toBe(0);
  });

  it('should update route slug if collision detected in the new crag', async () => {
    const duplicateSlugsInCrag = await queryRunner.query(
      `SELECT slug FROM route WHERE crag_id = '${mockData.crags.publishedCrag.id}' GROUP BY slug HAVING COUNT(id) > 1`,
    );
    expect(duplicateSlugsInCrag.length).toBe(0);
  });

  afterAll(async () => {
    await conn.destroy();
    await app.close();
  });
});
