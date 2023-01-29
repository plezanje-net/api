import { DataSource, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

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
      },
      basicUser2: {
        id: 'c828500a-4a10-4286-928c-e58202a94ea0',
        email: 'aliba.gundic@gmail.com',
        password: '123456789',
        authToken: null,
      },
      editorUser: {
        id: 'd00462ef-40e9-409c-af2d-479cd1accf08',
        email: 'edit.permisonic@gmail.com',
        password: '123456789',
        authToken: null,
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
                slug: 'highlyUnprobableSlug09832rf2',
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
                slug: 'route-slug-fc30922b',
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
    },
  };

  // Add users
  await qr.query(`INSERT INTO public.user (id, email, firstname, lastname, gender, password, "isActive")
    VALUES ('${mockData.users.basicUser1.id}', 'slavko.majonezic@gmail.com', 'Slavko', 'Majonezić', 'M', '$2b$10$BTiaP8iH11j.xFRcW3wIbuY4FTXaWW7friOLfmIv7CfHCz2D8Slam', true)`);

  await qr.query(`INSERT INTO public.user (id, email, firstname, lastname, gender, password, "isActive")
    VALUES ('${mockData.users.basicUser2.id}', 'aliba.gundic@gmail.com', 'Aliba', 'Gundič', 'F', '$2b$10$BTiaP8iH11j.xFRcW3wIbuY4FTXaWW7friOLfmIv7CfHCz2D8Slam', true)`);

  await qr.query(`INSERT INTO public.user (id, email, firstname, lastname, gender, password, "isActive")
    VALUES ('${mockData.users.editorUser.id}', 'edit.permisonic@gmail.com', 'Edit', 'Permisonič', null, '$2b$10$BTiaP8iH11j.xFRcW3wIbuY4FTXaWW7friOLfmIv7CfHCz2D8Slam', true)`);

  // TODO: admin role in this context should become editor role
  await qr.query(
    `INSERT INTO role (role, "userId") VALUES ('admin', '${mockData.users.editorUser.id}')`,
  );

  // Get auth tokens for all users and save them in mockData
  mockData.users.basicUser1.authToken = await getAuthToken(
    app,
    mockData.users.basicUser1.email,
    mockData.users.basicUser1.password,
  );
  mockData.users.basicUser2.authToken = await getAuthToken(
    app,
    mockData.users.basicUser2.email,
    mockData.users.basicUser2.password,
  );
  mockData.users.editorUser.authToken = await getAuthToken(
    app,
    mockData.users.editorUser.email,
    mockData.users.editorUser.password,
  );

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
    `INSERT INTO crag (id, name, slug, "countryId", "defaultGradingSystemId", type, "publishStatus", "isHidden", "userId")
    VALUES ('${mockData.crags.publishedCrag.id}', 'Kot Tečnik', '${mockData.crags.publishedCrag.slug}', '${mockData.countries.slovenia.id}', 'french', 'sport', 'published', false, '${mockData.users.basicUser1.id}')`,
  );
  // in review crag
  await qr.query(
    `INSERT INTO crag (id, name, slug, "countryId", "defaultGradingSystemId", type, "publishStatus", "isHidden", "userId")
    VALUES ('${mockData.crags.inReviewCrag.id}', 'Podstenčnik', 'podstencnik', '${mockData.countries.slovenia.id}', 'french', 'sport', 'in_review', false, '${mockData.users.basicUser1.id}')`,
  );
  // draft crag
  await qr.query(
    `INSERT INTO crag (id, name, slug, "countryId", "defaultGradingSystemId", type, "publishStatus", "isHidden", "userId")
    VALUES ('${mockData.crags.draftCrag.id}', 'Nova grapa', 'nova-grapa', '${mockData.countries.slovenia.id}', 'french', 'sport', 'draft', false, '${mockData.users.basicUser1.id}')`,
  );
  // crag with multiple sectors
  await qr.query(
    `INSERT INTO crag (id, name, slug, "countryId", "defaultGradingSystemId", type, "publishStatus", "isHidden", "userId")
    VALUES ('${mockData.crags.cragWithMultipleSectors.id}', 'Cre tata', '${mockData.crags.cragWithMultipleSectors.slug}', '${mockData.countries.slovenia.id}', 'french', 'sport', 'published', false, '${mockData.users.basicUser1.id}')`,
  );

  // Add some sectors
  // published sector in published crag
  await qr.query(
    `INSERT INTO sector (id, name, label, position, "cragId", "publishStatus")
    VALUES ('${mockData.crags.publishedCrag.sectors.publishedSector.id}', 'Leva stena', 'A', 1, '${mockData.crags.publishedCrag.id}', 'published')`,
  );
  // draft sector in published crag
  await qr.query(
    `INSERT INTO sector (id, name, label, position, "cragId", "publishStatus", "userId")
    VALUES ('${mockData.crags.publishedCrag.sectors.draftSector.id}', 'Drafpub wall', 'A', 1, '${mockData.crags.publishedCrag.id}', 'draft', '${mockData.users.basicUser1.id}')`,
  );
  // draft sector in draft crag
  await qr.query(
    `INSERT INTO sector (id, name, label, position, "cragId", "publishStatus", "userId")
    VALUES ('${mockData.crags.draftCrag.sectors.draftSector.id}', 'Drafna stena', 'A', 1, '${mockData.crags.draftCrag.id}', 'draft', '${mockData.users.basicUser1.id}')`,
  );
  // in_review sector in in_review crag
  await qr.query(
    `INSERT INTO sector (id, name, label, position, "cragId", "publishStatus")
    VALUES ('${mockData.crags.inReviewCrag.sectors.inReviewSector.id}', 'Pregledni sektor', 'B', 1, '${mockData.crags.inReviewCrag.id}', 'in_review')`,
  );
  // sectors in multiple sector crag
  await qr.query(
    `INSERT INTO sector (id, name, label, position, "cragId", "publishStatus")
    VALUES 
      ('${mockData.crags.cragWithMultipleSectors.sectors.firstSector.id}', 'Ostajajoci sektor', 'A', 1, '${mockData.crags.cragWithMultipleSectors.id}', 'published'),
      ('${mockData.crags.cragWithMultipleSectors.sectors.secondSector.id}', 'Odhajajoci sektor', 'B', 2, '${mockData.crags.cragWithMultipleSectors.id}', 'published')
    `,
  );

  // Add some routes
  // published route in published sector in published crag
  await qr.query(
    `INSERT INTO route (id, name, length, position, "sectorId", "cragId", "routeTypeId", "isProject", "defaultGradingSystemId", difficulty, slug, "publishStatus")
    VALUES ('${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.id}', 'Highly Unprobable Name 09832rf2', '11', 1, '${mockData.crags.publishedCrag.sectors.publishedSector.id}', '${mockData.crags.publishedCrag.id}', 'sport', false, 'french', '200', '${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.slug}', 'published')`,
  );
  // draft route in draft sector in published crag
  await qr.query(
    `INSERT INTO route (id, name, length, position, "sectorId", "cragId", "routeTypeId", "isProject", "defaultGradingSystemId", difficulty, slug, "publishStatus", "userId")
    VALUES ('${mockData.crags.publishedCrag.sectors.draftSector.routes.draftRoute.id}', 'Ta drafna pubka', '15', 1, '${mockData.crags.publishedCrag.sectors.draftSector.id}', '${mockData.crags.publishedCrag.id}', 'sport', false, 'french', '200', 'ta-drafna-pubka', 'draft', '${mockData.users.basicUser1.id}')`,
  );
  // draft route in draft sector in draft crag
  await qr.query(
    `INSERT INTO route (id, name, length, position, "sectorId", "cragId", "routeTypeId", "isProject", "defaultGradingSystemId", difficulty, slug, "publishStatus", "userId")
    VALUES ('${mockData.crags.draftCrag.sectors.draftSector.routes.draftRoute.id}', 'Ta nova', '12', 1, '${mockData.crags.draftCrag.sectors.draftSector.id}', '${mockData.crags.draftCrag.id}', 'sport', false, 'french', '200', 'ta-nova', 'draft', '${mockData.users.basicUser1.id}')`,
  );
  // in_review route in in_review sector in in_review crag
  await qr.query(
    `INSERT INTO route (id, name, length, position, "sectorId", "cragId", "routeTypeId", "isProject", "defaultGradingSystemId", difficulty, slug, "publishStatus")
    VALUES ('${mockData.crags.inReviewCrag.sectors.inReviewSector.routes.inReviewRoute.id}', 'Ta v pregledu', '14', 1, '${mockData.crags.inReviewCrag.sectors.inReviewSector.id}', '${mockData.crags.inReviewCrag.id}', 'sport', false, 'french', '200', 'ta-v-pregledu', 'in_review')`,
  );
  // routes in multipe sector crag
  await qr.query(
    `INSERT INTO route (id, name, length, position, "sectorId", "cragId", "routeTypeId", "isProject", "defaultGradingSystemId", difficulty, slug, "publishStatus")
    VALUES 
      ('${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.id}', 'Route Slug fc30922b', '11', 1, '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.id}', '${mockData.crags.cragWithMultipleSectors.id}', 'sport', false, 'french', '200', '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.firstRoute.slug}', 'published'),
      ('${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.secondRoute.id}', 'Route Slug 8a63ddcc', '11', 2, '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.id}', '${mockData.crags.cragWithMultipleSectors.id}', 'sport', false, 'french', '200', '${mockData.crags.cragWithMultipleSectors.sectors.firstSector.routes.secondRoute.slug}', 'published'),
      ('${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.id}', 'Route Slug 37dafa58', '11', 1, '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.id}', '${mockData.crags.cragWithMultipleSectors.id}', 'sport', false, 'french', '200', '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.firstRoute.slug}', 'published'),
      ('${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.secondRoute.id}', 'Route Slug 87ca8c06', '11', 2, '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.id}', '${mockData.crags.cragWithMultipleSectors.id}', 'sport', false, 'french', '200', '${mockData.crags.cragWithMultipleSectors.sectors.secondSector.routes.secondRoute.slug}', 'published')
    `,
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

export { prepareEnvironment, initializeDbConn, seedDatabase };
