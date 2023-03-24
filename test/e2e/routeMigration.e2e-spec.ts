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

describe('RouteMigration', () => {
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
        date: '2001-02-01',
      },
      activityWithDuplicateRoute: {
        id: '85853921-9e23-8c20-8c20-eeb74bb0f26c',
        date: '2001-04-01',
      },
    };

    await queryRunner.query(
      `INSERT INTO activity (id, "cragId", type, name, date, "userId")
        VALUES ('${mockData.activities.activityAcrossSectors.id}', '${mockData.crags.cragWithMultipleSectors.id}', '${ActivityType.CRAG}', 'Activity to be split', '${mockData.activities.activityAcrossSectors.date}', '${mockData.users.basicUser1.id}'),
        ('${mockData.activities.activityWithDuplicateRoute.id}', '${mockData.crags.cragWithMultipleSectors.id}', '${ActivityType.CRAG}', 'Activity to be split', '${mockData.activities.activityWithDuplicateRoute.date}', '${mockData.users.basicUser1.id}')
        `,
    );
    await queryRunner.query(
      `INSERT INTO activity_route ("ascentType", publish, "activityId", "routeId", "userId", date)
        VALUES
          ('${AscentType.ONSIGHT}', 'log', '${mockData.activities.activityAcrossSectors.id}', '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}', '${mockData.users.basicUser1.id}', '${mockData.activities.activityAcrossSectors.date}'),
          ('${AscentType.ONSIGHT}', 'log', '${mockData.activities.activityWithDuplicateRoute.id}', '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.id}', '${mockData.users.basicUser1.id}', '${mockData.activities.activityWithDuplicateRoute.date}')
          `,
    );

    await queryRunner.query(
      `INSERT INTO difficulty_vote (difficulty, created, "userId", "routeId", "isBase", "includedInCalculation")
        VALUES
          (1000, '2001-01-01', null, '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}', true, false),
          (1100, '${mockData.activities.activityAcrossSectors.date}', '${mockData.users.basicUser1.id}', '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}', false, true),
          (1200, '${mockData.activities.activityAcrossSectors.date}', '${mockData.users.basicUser2.id}', '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}', false, false),
          (1100, '2001-01-20', null, '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.id}', true, true),
          (1200, '${mockData.activities.activityWithDuplicateRoute.date}', '${mockData.users.basicUser1.id}', '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.id}', false, false)
        `,
    );

    await queryRunner.query(
      `INSERT INTO comment (type, "userId", content, status, "routeId") VALUES
        ('comment', '${mockData.users.basicUser1.id}', 'Comment 1', 'active', '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}'),
        ('comment', '${mockData.users.basicUser1.id}', 'Comment 1', 'active', '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.id}'),
        ('comment', '${mockData.users.basicUser1.id}', 'Comment 3', 'active', '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.id}'),
        ('comment', '${mockData.users.basicUser1.id}', 'Comment 4', 'active', '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.secondRoute.id}')
      `,
    );

    await queryRunner.query(
      `INSERT INTO star_rating_vote (stars, "userId", created, "routeId") VALUES
        (1, '${mockData.users.basicUser1.id}', '${mockData.activities.activityAcrossSectors.date}', '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}'),
        (1, '${mockData.users.basicUser2.id}', '${mockData.activities.activityWithDuplicateRoute.date}', '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}'),
        (2, '${mockData.users.basicUser1.id}', '${mockData.activities.activityWithDuplicateRoute.date}', '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.id}'),
        (2, '${mockData.users.basicUser2.id}', '${mockData.activities.activityAcrossSectors.date}', '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.id}')
      `,
    );

    await queryRunner.query(
      `INSERT INTO property_type (id, name, "valueType", position) VALUES
        ('nrQuickdraws', 'Nr Quickdraws', 'number', 1),
        ('firstAscent', 'First Ascent', 'string', 2)
      `,
    );

    await queryRunner.query(
      `INSERT INTO route_property ("propertyTypeId", "stringValue", "numValue", "routeId", position) VALUES
        ('firstAscent', 'First first ascensionist', null, '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}', 0),
        ('firstAscent', 'Second first ascensionist', null, '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.id}', 0),
        ('nrQuickdraws', null, 5, '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.id}', 0)
      `,
    );
  });

  it('should move the route to a new sector', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.editorUser.authToken}`)
      .send({
        query: `
        mutation {
          moveRouteToSector(input: { id: "${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.secondRoute.id}", sectorId: "${mockData.crags.cragWithMultipleSectors.sectors.secondSector.id}" })
        }
      `,
      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    const sourceSectorRoutes = await queryRunner.query(
      `SELECT * FROM route WHERE "sectorId" = '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.id}'`,
    );
    expect(sourceSectorRoutes.length).toBe(1);
    const targetSectorRoutes = await queryRunner.query(
      `SELECT * FROM route WHERE "sectorId" = '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.id}'`,
    );
    expect(targetSectorRoutes.length).toBe(3);
  });

  it('should merge the routes if target specified', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${mockData.users.editorUser.authToken}`)
      .send({
        query: `
        mutation {
          moveRouteToSector(input: {
            id: "${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}",
            sectorId: "${mockData.crags.cragWithMultipleSectors.sectors.secondSector.id}",
            targetRouteId: "${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.id}",
            primaryRoute: "source"
          })
        }
      `,
      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    const sourceSectorRoutes = await queryRunner.query(
      `SELECT * FROM route WHERE "sectorId" = '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.id}'`,
    );
    expect(sourceSectorRoutes.length).toBe(0);
    const targetSectorRoutes = await queryRunner.query(
      `SELECT * FROM route WHERE "sectorId" = '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.id}'`,
    );
    expect(targetSectorRoutes.length).toBe(3);
  });

  it('should change ascent types if invalid state happens after merge', async () => {
    const onsightAscentsOfRoute = await queryRunner.query(
      `SELECT * FROM activity_route WHERE "routeId" = '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}' AND "userId" = '${mockData.users.basicUser1.id}' AND "ascentType" = '${AscentType.ONSIGHT}'`,
    );
    expect(onsightAscentsOfRoute.length).toBe(1);
  });

  it('should only keep latest base and each user grade', async () => {
    const difficultyVotes = await queryRunner.query(
      `SELECT * FROM difficulty_vote WHERE "routeId" = '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}'`,
    );
    expect(difficultyVotes.length).toBe(3);

    const updatedRoute = await queryRunner.query(
      `SELECT * FROM route WHERE id = '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}'`,
    );
    expect(updatedRoute[0].difficulty).toBe(1200);
  });

  it('should transfer all comments to target route', async () => {
    const comments = await queryRunner.query(
      `SELECT * FROM comment WHERE "routeId" = '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}'`,
    );
    expect(comments.length).toBe(3);
  });

  it('should use only the latest star rating per user', async () => {
    const starRatings = await queryRunner.query(
      `SELECT * FROM star_rating_vote WHERE "routeId" = '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}'`,
    );
    expect(starRatings.length).toBe(2);
    expect(starRatings[0].stars + starRatings[1].stars).toBe(3);
  });

  it('should migrate route properties from secondary route unless already present on target', async () => {
    const routeProperties = await queryRunner.query(
      `SELECT * FROM route_property WHERE "routeId" = '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}' ORDER BY "propertyTypeId" ASC`,
    );
    expect(routeProperties.length).toBe(2);
    expect(routeProperties[0].stringValue).toBe('First first ascensionist');
    expect(routeProperties[1].numValue).toBe(5);
  });

  afterAll(async () => {
    await conn.destroy();
    await app.close();
  });
});
