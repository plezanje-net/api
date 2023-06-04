import { DataSource, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ActivityType } from '../../src/activities/entities/activity.entity';

const prepareEnvironment = async () => {
  process.env.JWT_SECRET = '456755345g6345g63456g345g63456';
  process.env.DB_HOST = 'localhost';
  process.env.DB_USER = 'plezanjenet';
  process.env.DB_PASSWORD = 'plezanjenet';
  process.env.DB_NAME = 'plezanjenet';
  process.env.DB_PORT = '5434';

  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6381';
};

const initializeDbConn = async (app: INestApplication): Promise<DataSource> => {
  const conn = app.get(DataSource);

  const query = fs.readFileSync('./test/e2e/sql/init.sql', 'utf8');

  await conn.createQueryRunner().query(query);
  await conn.synchronize(true);

  const triggersQuery = fs.readFileSync('./test/e2e/sql/triggers.sql', 'utf8');
  await conn.createQueryRunner().query(triggersQuery);

  return conn;
};

/**
 *
 * Seed database with some data that all tests might need
 * Return a mock object that contains all the data that the tests should need
 *
 */
const seedDatabase = async (qr: QueryRunner, app) => {
  const mockData = {
    users: {
      basicUser1: {
        id: '25d23a86-0649-466c-b57d-4200bb2f7389',
        email: 'slavko.majonezic@gmail.com',
        password: '123456789',
        authToken: null,
        passwordHash:
          '$2b$10$BTiaP8iH11j.xFRcW3wIbuY4FTXaWW7friOLfmIv7CfHCz2D8Slam',
        firstname: 'Slavko',
        lastname: 'Majonezić',
      },
      basicUser2: {
        id: 'c828500a-4a10-4286-928c-e58202a94ea0',
        email: 'aliba.gundic@gmail.com',
        password: '123456789',
        authToken: null,
        passwordHash:
          '$2b$10$BTiaP8iH11j.xFRcW3wIbuY4FTXaWW7friOLfmIv7CfHCz2D8Slam',
        firstname: 'Aliba',
        lastname: 'Gundić',
      },
      basicUser3: {
        id: 'ea923bb8-011b-11ee-be56-0242ac120002',
        email: 'goran.vampic@gmail.com',
        password: '123456789',
        authToken: null,
        passwordHash:
          '$2b$10$BTiaP8iH11j.xFRcW3wIbuY4FTXaWW7friOLfmIv7CfHCz2D8Slam',
        firstname: 'Goran',
        lastname: 'Vampić',
      },
      basicUser4: {
        id: 'f11d4144-011b-11ee-be56-0242ac120002',
        email: 'dusan.kokol@gmail.com',
        password: '123456789',
        authToken: null,
        passwordHash:
          '$2b$10$BTiaP8iH11j.xFRcW3wIbuY4FTXaWW7friOLfmIv7CfHCz2D8Slam',
        firstname: 'Dušan',
        lastname: 'Kokol',
      },
      basicUser5: {
        id: 'f5c40fe8-011b-11ee-be56-0242ac120002',
        email: 'drilon.semispahic@gmail.com',
        password: '123456789',
        authToken: null,
        passwordHash:
          '$2b$10$BTiaP8iH11j.xFRcW3wIbuY4FTXaWW7friOLfmIv7CfHCz2D8Slam',
        firstname: 'Drilon',
        lastname: 'Semispahić',
      },
      editorUser: {
        id: 'd00462ef-40e9-409c-af2d-479cd1accf08',
        email: 'edit.permisonic@gmail.com',
        password: '123456789',
        authToken: null,
        passwordHash:
          '$2b$10$BTiaP8iH11j.xFRcW3wIbuY4FTXaWW7friOLfmIv7CfHCz2D8Slam',
        firstname: 'Edit',
        lastname: 'Permisonić',
      },
      superAdminUser: {
        id: 'ee872476-ffd2-11ed-be56-0242ac120002',
        email: 'tomaz.bevk@gmail.com',
        password: '123456789',
        authToken: null,
        passwordHash:
          '$2b$10$BTiaP8iH11j.xFRcW3wIbuY4FTXaWW7friOLfmIv7CfHCz2D8Slam',
        firstname: 'Tomaž',
        lastname: 'Bevk',
      },
    },

    countries: {
      slovenia: {
        id: '52b0d786-866e-4d56-8267-debc0e963ccb',
      },
    },

    crags: {
      publishedCrag: {
        id: 'c370e2bf-9211-4d3e-819f-61d302646bc4',
        slug: 'kot-tecnik',
        sectors: {
          publishedSector: {
            id: '462a3c44-c4ca-49d1-bc06-7173b4f1fbd8',
            routes: {
              publishedRoute: {
                id: 'c9b9b9e9-1b9a-4b9a-8b9a-1b9a4b9a8b9a',
                slug: 'highly-unprobable-name-09832rf2',
              },
            },
          },
          draftSector: {
            id: 'f823a42b-09ed-4437-b1a9-7d24677183e2',
            routes: {
              draftRoute: {
                id: '7068fb9d-b1ff-4933-b674-2c97b0f52e71',
              },
            },
          },
        },
      },
      inReviewCrag: {
        id: 'a700997e-78f3-4f5b-9faf-2f8d0f0ab8e8',
        sectors: {
          inReviewSector: {
            id: 'db26bbae-6fb8-49ea-a2a5-9e94a472deae',
            routes: {
              inReviewRoute: {
                id: '345c948f-5fe3-4491-a610-3743fb97bad0',
              },
            },
          },
        },
      },
      draftCrag: {
        id: '2447ac1c-ba42-4f72-9fea-8489b91df5aa',
        sectors: {
          draftSector: {
            id: '5407e2b2-8589-40cf-b8bc-b6ef59044765',
            routes: {
              draftRoute: {
                id: 'c7119b96-cfbc-48de-81f0-25830cce1310',
              },
            },
          },
        },
      },
      cragWithMultipleSectors: {
        id: '5cc7f53e-525a-4ef9-9792-8400ccdc0ae2',
        slug: 'cre-tata',
        sectors: {
          firstSector: {
            id: '2c76bd33-89c2-4a7c-80e1-c9ad9d1b8ca8',
            routes: {
              firstRoute: {
                id: 'fc30922b-fcc6-4461-9776-fe7692f55471',
                slug: 'highly-unprobable-name-09832rf2',
              },
              secondRoute: {
                id: '8a63ddcc-9b9a-4124-847b-f63801ca7769',
                slug: 'route-slug-8a63ddcc',
              },
            },
          },
          secondSector: {
            id: '43aa6c1a-7d39-46f6-ac9c-b7304351211c',
            routes: {
              firstRoute: {
                id: '37dafa58-352c-4d41-9077-9dd71f5154e2',
                slug: 'route-slug-37dafa58',
              },
              secondRoute: {
                id: '87ca8c06-3a92-434a-a666-94be5842a27e',
                slug: 'route-slug-87ca8c06',
              },
            },
          },
        },
      },
      simpleCrag: {
        id: '6dd8f080-f0d6-11ed-a05b-0242ac120003',
        slug: 'simple-crag',
        sectors: {
          simpleSector1: {
            id: '7cbd9204-f0d6-11ed-a05b-0242ac120003',
            routes: [
              // 0:
              {
                id: '9c1f82a6-f0d6-11ed-a05b-0242ac120003',
                slug: '9c1f82a6-f0d6-11ed-a05b-0242ac120003',
                name: '9c1f82a6-f0d6-11ed-a05b-0242ac120003',
                difficulty: 1000,
              },
              // 1:
              {
                id: '9c1f89c2-f0d6-11ed-a05b-0242ac120003',
                slug: '9c1f89c2-f0d6-11ed-a05b-0242ac120003',
                name: '9c1f89c2-f0d6-11ed-a05b-0242ac120003',
                difficulty: 1100,
              },
              // 2:
              {
                id: '9c1f8bac-f0d6-11ed-a05b-0242ac120003',
                slug: '9c1f8bac-f0d6-11ed-a05b-0242ac120003',
                name: '9c1f8bac-f0d6-11ed-a05b-0242ac120003',
                difficulty: 1200,
              },
              // 3:
              {
                id: '9c1f8d46-f0d6-11ed-a05b-0242ac120003',
                slug: '9c1f8d46-f0d6-11ed-a05b-0242ac120003',
                name: '9c1f8d46-f0d6-11ed-a05b-0242ac120003',
                difficulty: 1300,
              },
              // 4:
              {
                id: '9c1f8e68-f0d6-11ed-a05b-0242ac120003',
                slug: '9c1f8e68-f0d6-11ed-a05b-0242ac120003',
                name: '9c1f8e68-f0d6-11ed-a05b-0242ac120003',
                difficulty: 1400,
              },
              // 5:
              {
                id: '9c1f8fa8-f0d6-11ed-a05b-0242ac120003',
                slug: '9c1f8fa8-f0d6-11ed-a05b-0242ac120003',
                name: '9c1f8fa8-f0d6-11ed-a05b-0242ac120003',
                difficulty: 1500,
              },
              // 6:
              {
                id: '9c1f90d4-f0d6-11ed-a05b-0242ac120003',
                slug: '9c1f90d4-f0d6-11ed-a05b-0242ac120003',
                name: '9c1f90d4-f0d6-11ed-a05b-0242ac120003',
                difficulty: 1600,
              },
              // 7:
              {
                id: '9c1f9200-f0d6-11ed-a05b-0242ac120003',
                slug: '9c1f9200-f0d6-11ed-a05b-0242ac120003',
                name: '9c1f9200-f0d6-11ed-a05b-0242ac120003',
                difficulty: 1700,
              },
              // 8:
              {
                id: '9c1f9598-f0d6-11ed-a05b-0242ac120003',
                slug: '9c1f9598-f0d6-11ed-a05b-0242ac120003',
                name: '9c1f9598-f0d6-11ed-a05b-0242ac120003',
                difficulty: 1800,
              },
              // 9:
              {
                id: '9c1f96ce-f0d6-11ed-a05b-0242ac120003',
                slug: '9c1f96ce-f0d6-11ed-a05b-0242ac120003',
                name: '9c1f96ce-f0d6-11ed-a05b-0242ac120003',
                difficulty: 1900,
              },
              // 10:
              {
                id: '9c1f97f0-f0d6-11ed-a05b-0242ac120003',
                slug: '9c1f97f0-f0d6-11ed-a05b-0242ac120003',
                name: '9c1f97f0-f0d6-11ed-a05b-0242ac120003',
                difficulty: 2000,
              },
              // 11:
              {
                id: '9c1f9926-f0d6-11ed-a05b-0242ac120003',
                slug: '9c1f9926-f0d6-11ed-a05b-0242ac120003',
                name: '9c1f9926-f0d6-11ed-a05b-0242ac120003',
                difficulty: 2100,
              },
              // 12:
              {
                id: '9c1f9a5c-f0d6-11ed-a05b-0242ac120003',
                slug: '9c1f9a5c-f0d6-11ed-a05b-0242ac120003',
                name: '9c1f9a5c-f0d6-11ed-a05b-0242ac120003',
                difficulty: 2200,
              },
              // 13:
              {
                id: '08a14a5e-f0d7-11ed-a05b-0242ac120003',
                slug: '08a14a5e-f0d7-11ed-a05b-0242ac120003',
                name: '08a14a5e-f0d7-11ed-a05b-0242ac120003',
                difficulty: 2300,
              },
            ],
          },
        },
      },
    },

    peaks: {
      simplePeak: {
        id: 'bb081bbc-0128-11ee-be56-0242ac120002',
        slug: 'simple-peak',
        name: 'Simple Peak',
      },
    },

    icefalls: {
      simpleIcefall: {
        id: '2481aeda-012b-11ee-be56-0242ac120002',
        slug: 'simple-icefall',
        name: 'Simple Icefall',
      },
    },

    clubs: {
      simpleClub: {
        id: '6dfb624e-0140-11ee-be56-0242ac120002',
        name: 'Simple Club',
        slug: 'simple-club',
      },
    },

    routeEvents: {
      simpleEvent: {
        id: '6ea2ee90-0147-11ee-be56-0242ac120002',
        author: 'Slavko Majonezić',
      },
    },
  };

  // Add users
  for (const user of Object.values(mockData.users)) {
    await qr.query(`INSERT INTO public.user (id, email, firstname, lastname, password, is_active)
    VALUES ('${user.id}', '${user.email}', '${user.firstname}', '${user.lastname}', '${user.passwordHash}', true)`);

    // Get auth token and save it back to mockData object
    user.authToken = await getAuthToken(app, user.email, user.password);
  }

  // Add roles for the special users
  // TODO: admin role in this context should become editor role
  await qr.query(
    `INSERT INTO role (role, user_id) VALUES ('admin', '${mockData.users.editorUser.id}')`,
  );
  // superadmin role is determind via email ??!!?
  // TODO: this is just not nice. implement superadmin role and add it here...

  // Add countries
  let q = fs.readFileSync('./test/e2e/sql/country.sql', 'utf8');
  await qr.query(q);

  // Add grading systems
  q = fs.readFileSync('./test/e2e/sql/grading_system.sql', 'utf8');
  await qr.query(q);

  // Add route types
  q = fs.readFileSync('./test/e2e/sql/route_type.sql', 'utf8');
  await qr.query(q);

  // Add grading system route type combinatons
  q = fs.readFileSync('./test/e2e/sql/grading_system_route_type.sql', 'utf8');
  await qr.query(q);

  // Add some crags
  // published crag
  await qr.query(
    `INSERT INTO crag (id, name, slug, country_id, default_grading_system_id, type, publish_status, is_hidden, user_id)
    VALUES ('${mockData.crags.publishedCrag.id}', 'Kot Tečnik', '${mockData.crags.publishedCrag.slug}', '${mockData.countries.slovenia.id}', 'french', 'sport', 'published', false, '${mockData.users.basicUser1.id}')`,
  );
  // in review crag
  await qr.query(
    `INSERT INTO crag (id, name, slug, country_id, default_grading_system_id, type, publish_status, is_hidden, user_id)
    VALUES ('${mockData.crags.inReviewCrag.id}', 'Podstenčnik', 'podstencnik', '${mockData.countries.slovenia.id}', 'french', 'sport', 'in_review', false, '${mockData.users.basicUser1.id}')`,
  );
  // draft crag
  await qr.query(
    `INSERT INTO crag (id, name, slug, country_id, default_grading_system_id, type, publish_status, is_hidden, user_id)
    VALUES ('${mockData.crags.draftCrag.id}', 'Nova grapa', 'nova-grapa', '${mockData.countries.slovenia.id}', 'french', 'sport', 'draft', false, '${mockData.users.basicUser1.id}')`,
  );
  // crag with multiple sectors
  await qr.query(
    `INSERT INTO crag (id, name, slug, country_id, default_grading_system_id, type, publish_status, is_hidden, user_id)
    VALUES ('${mockData.crags.cragWithMultipleSectors.id}', 'Cre tata', '${mockData.crags.cragWithMultipleSectors.slug}', '${mockData.countries.slovenia.id}', 'french', 'sport', 'published', false, '${mockData.users.basicUser1.id}')`,
  );
  // simple crag
  await qr.query(
    `INSERT INTO crag (id, name, slug, country_id, default_grading_system_id, type, publish_status, is_hidden, user_id)
    VALUES ('${mockData.crags.simpleCrag.id}', 'Cragus simplus', '${mockData.crags.simpleCrag.slug}', '${mockData.countries.slovenia.id}', 'french', 'sport', 'published', false, '${mockData.users.basicUser1.id}')`,
  );

  // Add some sectors
  // published sector in published crag
  await qr.query(
    `INSERT INTO sector (id, name, label, position, crag_id, publish_status, user_id)
    VALUES ('${mockData.crags.publishedCrag.sectors.publishedSector.id}', 'Leva stena', 'A', 1, '${mockData.crags.publishedCrag.id}', 'published', '${mockData.users.basicUser1.id}')`,
  );
  // draft sector in published crag
  await qr.query(
    `INSERT INTO sector (id, name, label, position, crag_id, publish_status, user_id)
    VALUES ('${mockData.crags.publishedCrag.sectors.draftSector.id}', 'Drafpub wall', 'A', 1, '${mockData.crags.publishedCrag.id}', 'draft', '${mockData.users.basicUser1.id}')`,
  );
  // draft sector in draft crag
  await qr.query(
    `INSERT INTO sector (id, name, label, position, crag_id, publish_status, user_id)
    VALUES ('${mockData.crags.draftCrag.sectors.draftSector.id}', 'Drafna stena', 'A', 1, '${mockData.crags.draftCrag.id}', 'draft', '${mockData.users.basicUser1.id}')`,
  );
  // in_review sector in in_review crag
  await qr.query(
    `INSERT INTO sector (id, name, label, position, crag_id, publish_status, user_id)
    VALUES ('${mockData.crags.inReviewCrag.sectors.inReviewSector.id}', 'Pregledni sektor', 'B', 1, '${mockData.crags.inReviewCrag.id}', 'in_review', '${mockData.users.basicUser1.id}')`,
  );
  // sectors in multiple sector crag
  await qr.query(
    `INSERT INTO sector (id, name, label, position, crag_id, publish_status)
    VALUES 
      ('${mockData.crags.cragWithMultipleSectors.sectors.firstSector.id}', 'Ostajajoci sektor', 'A', 1, '${mockData.crags.cragWithMultipleSectors.id}', 'published'),
      ('${mockData.crags.cragWithMultipleSectors.sectors.secondSector.id}', 'Odhajajoci sektor', 'B', 2, '${mockData.crags.cragWithMultipleSectors.id}', 'published')
    `,
  );
  // simple sector 1 in simple crag
  await qr.query(
    `INSERT INTO sector (id, name, label, position, crag_id, publish_status)
    VALUES ('${mockData.crags.simpleCrag.sectors.simpleSector1.id}', 'Secotrius simplicus', 'A', 1, '${mockData.crags.simpleCrag.id}', 'published')`,
  );

  // Add some routes
  // published route in published sector in published crag
  await qr.query(
    `INSERT INTO route (id, name, length, position, sector_id, crag_id, route_type_id, is_project, default_grading_system_id, difficulty, slug, publish_status)
    VALUES ('${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.id}', 'Highly Unprobable Name 09832rf2', '11', 1, '${mockData.crags.publishedCrag.sectors.publishedSector.id}', '${mockData.crags.publishedCrag.id}', 'sport', false, 'french', '200', '${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.slug}', 'published')`,
  );
  // draft route in draft sector in published crag
  await qr.query(
    `INSERT INTO route (id, name, length, position, sector_id, crag_id, route_type_id, is_project, default_grading_system_id, difficulty, slug, publish_status, user_id)
    VALUES ('${mockData.crags.publishedCrag.sectors.draftSector.routes.draftRoute.id}', 'Ta drafna pubka', '15', 1, '${mockData.crags.publishedCrag.sectors.draftSector.id}', '${mockData.crags.publishedCrag.id}', 'sport', false, 'french', '200', 'ta-drafna-pubka', 'draft', '${mockData.users.basicUser1.id}')`,
  );
  // draft route in draft sector in draft crag
  await qr.query(
    `INSERT INTO route (id, name, length, position, sector_id, crag_id, route_type_id, is_project, default_grading_system_id, difficulty, slug, publish_status, user_id)
    VALUES ('${mockData.crags.draftCrag.sectors.draftSector.routes.draftRoute.id}', 'Ta nova', '12', 1, '${mockData.crags.draftCrag.sectors.draftSector.id}', '${mockData.crags.draftCrag.id}', 'sport', false, 'french', '200', 'ta-nova', 'draft', '${mockData.users.basicUser1.id}')`,
  );
  // in_review route in in_review sector in in_review crag
  await qr.query(
    `INSERT INTO route (id, name, length, position, sector_id, crag_id, route_type_id, is_project, default_grading_system_id, difficulty, slug, publish_status, user_id)
    VALUES ('${mockData.crags.inReviewCrag.sectors.inReviewSector.routes.inReviewRoute.id}', 'Ta v pregledu', '14', 1, '${mockData.crags.inReviewCrag.sectors.inReviewSector.id}', '${mockData.crags.inReviewCrag.id}', 'sport', false, 'french', '200', 'ta-v-pregledu', 'in_review', '${mockData.users.basicUser1.id}')`,
  );
  // routes in multipe sector crag
  await qr.query(
    `INSERT INTO route (id, name, length, position, sector_id, crag_id, route_type_id, is_project, default_grading_system_id, difficulty, slug, publish_status)
    VALUES 
      ('${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}', 'Highly Unprobable Name 09832rf2', '11', 1, '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.id}', '${mockData.crags.cragWithMultipleSectors.id}', 'sport', false, 'french', '200', '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.slug}', 'published'),
      ('${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.secondRoute.id}', 'Route Slug 8a63ddcc', '11', 2, '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.id}', '${mockData.crags.cragWithMultipleSectors.id}', 'sport', false, 'french', '200', '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.secondRoute.slug}', 'published'),
      ('${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.id}', 'Route Slug 37dafa58', '11', 1, '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.id}', '${mockData.crags.cragWithMultipleSectors.id}', 'sport', false, 'french', '200', '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.slug}', 'published'),
      ('${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.secondRoute.id}', 'Route Slug 87ca8c06', '11', 2, '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.id}', '${mockData.crags.cragWithMultipleSectors.id}', 'sport', false, 'french', '200', '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.secondRoute.slug}', 'published')
    `,
  );
  // all routes in a simple crag's sector1
  for (const [
    i,
    route,
  ] of mockData.crags.simpleCrag.sectors.simpleSector1.routes.entries()) {
    await qr.query(
      `INSERT INTO route (id, name, route_type_id, default_grading_system_id, position, crag_id, sector_id, difficulty)
       VALUES (
        '${route.id}',
        '${route.name}',
        'sport',
        'french',
        ${i + 1},
        '${mockData.crags.simpleCrag.id}',
        '${mockData.crags.simpleCrag.sectors.simpleSector1.id}',
        ${route.difficulty}
       )`,
    );
  }
  for (const route of mockData.crags.simpleCrag.sectors.simpleSector1.routes) {
    await qr.query(
      `INSERT INTO difficulty_vote (difficulty, is_base, route_id)
       VALUES (
         ${route.difficulty},
         true,
        '${route.id}'
       )`,
    );
  }

  // Add a peak
  await qr.query(
    `INSERT INTO peak (id, name, slug, country_id)
      VALUES ('${mockData.peaks.simplePeak.id}', '${mockData.peaks.simplePeak.name}', '${mockData.peaks.simplePeak.slug}', '${mockData.countries.slovenia.id}')`,
  );

  // Add an icefall
  await qr.query(
    `INSERT INTO ice_fall (id, name, slug, country_id, position)
      VALUES ('${mockData.icefalls.simpleIcefall.id}', '${mockData.icefalls.simpleIcefall.name}', '${mockData.icefalls.simpleIcefall.slug}', '${mockData.countries.slovenia.id}', 1)`,
  );

  // Add a club
  await qr.query(
    `INSERT INTO club (id, name, slug)
      VALUES ('${mockData.clubs.simpleClub.id}', '${mockData.clubs.simpleClub.name}', '${mockData.clubs.simpleClub.slug}')`,
  );
  // Add basicUser1 as a club member
  await qr.query(
    `INSERT INTO club_member (user_id, club_id, admin)
      VALUES ('${mockData.users.basicUser1.id}', '${mockData.clubs.simpleClub.id}', true)`,
  );

  // Add a route event linked to a user
  await qr.query(
    `INSERT INTO route_event (id, route_id, user_id, author, event_date)
      VALUES ('${mockData.routeEvents.simpleEvent.id}', '${mockData.crags.simpleCrag.sectors.simpleSector1.routes[0].id}', '${mockData.users.basicUser1.id}', '${mockData.routeEvents.simpleEvent.author}', '2015-05-05')`,
  );

  return mockData;
};

const getAuthToken = async (app, email: string, password: string) => {
  const response = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      query: `
        mutation {
          login(input: { email: "${email}", password: "${password}" }) {
              token
          }
        }
      `,
    });
  return response.body.data.login.token;
};

const logRoutes = async (app, user, crag, ascents, date = '2017-03-07') => {
  const activityCreateResponse = await request(app.getHttpServer())
    .post('/graphql')
    .set('Authorization', `Bearer ${user.authToken}`)
    .send({
      query: `
      mutation {
        createActivity(
          input: {
            date: "${date}",
            name: "test",
            type: "${ActivityType.CRAG}",
            cragId: "${crag.id}"
          },
          routes: [
          ${ascents.map(
            (ascent) => `{
            ascentType: "${ascent.ascentType}",
            publish: "${ascent.publishType}",
            date: "${date}",
            routeId: "${ascent.route.id}",
            votedDifficulty: ${ascent.votedDifficulty || null},
            votedStarRating: ${ascent.votedStarRating || null}
          }`,
          )}]
          
        )
        {
          id
        }
      }
    `,
    });
  return activityCreateResponse;
};

const comment = async (
  app,
  user,
  commentType,
  routeId,
  cragId,
  icefallId,
  peakId,
  exposedUntil,
) => {
  const commentCreateResponse = await request(app.getHttpServer())
    .post('/graphql')
    .set('Authorization', `Bearer ${user.authToken}`)
    .send({
      query: `
      mutation {
        createComment(
          input: {
            type: "${commentType}",
            content: "test comment",
            routeId: ${routeId ? `"${routeId}"` : null},
            cragId: ${cragId ? `"${cragId}"` : null},
            iceFallId: ${icefallId ? `"${icefallId}"` : null},
            peakId: ${peakId ? `"${peakId}"` : null},
            exposedUntil: ${exposedUntil ? `"${exposedUntil}"` : null}
          }
        )
        {
          id
        }
      }
    `,
    });
  return commentCreateResponse;
};

export {
  prepareEnvironment,
  initializeDbConn,
  seedDatabase,
  logRoutes,
  comment,
};
