import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { QueryRunner } from 'typeorm';
import { initializeDbConn, prepareEnvironment, seedDatabase } from './helpers';
import { UsersModule } from '../../src/users/users.module';
import { CragsModule } from '../../src/crags/crags.module';
import { env } from 'process';
import * as fs from 'fs';
import { sizes } from '../../src/crags/entities/image.entity';
import { INestApplication, ValidationPipe } from '@nestjs/common';

describe('Upload', () => {
  let app: INestApplication;
  let queryRunner: QueryRunner;

  let mockData: any;

  beforeAll(async () => {
    prepareEnvironment();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UsersModule, CragsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const conn = await initializeDbConn(app);
    queryRunner = conn.createQueryRunner();

    mockData = await seedDatabase(queryRunner, app);
  });

  it('should fail if not logged in', () => {
    return request(app.getHttpServer())
      .post('/upload/image')
      .expect(401);
  });

  it('should fail if entityId field is missing', () => {
    return request(app.getHttpServer())
      .post('/upload/image')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('entityType', 'crag')
      .field('title', 'An image of a crag')
      .field('type', 'photo')
      .field('description', 'This is this crag')
      .attach('image', `${__dirname}/testImage.jpg`)
      .expect(400); // bad request
  });

  it('should fail if entityType field is missing', () => {
    return request(app.getHttpServer())
      .post('/upload/image')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('entityId', mockData.crags.publishedCrag.id)
      .field('title', 'An image of a crag')
      .field('type', 'photo')
      .field('description', 'This is this crag')
      .attach('image', `${__dirname}/testImage.jpg`)
      .expect(400); // bad request
  });

  it('should succeed uploading a crag image', async () => {
    const response = await request(app.getHttpServer())
      .post('/upload/image')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('entityId', mockData.crags.publishedCrag.id)
      .field('entityType', 'crag')
      .field('title', 'An image of a crag')
      .field('type', 'photo')
      .field('description', 'This is this crag')
      .attach('image', `${__dirname}/testImage.jpg`)
      .expect(201);

    // Check that newly generated image files exist
    const imagesPath = `${__dirname}/../../${env.STORAGE_PATH}/images`;
    const stem = mockData.crags.publishedCrag.slug;
    expect(fs.existsSync(`${imagesPath}/crags/${stem}.jpg`)).toBe(true);
    sizes.forEach(size => {
      const imageStemPath = `${imagesPath}/${size}/crags/${stem}`;
      expect(fs.existsSync(`${imageStemPath}.jpg`)).toBe(true);
      expect(fs.existsSync(`${imageStemPath}.webp`)).toBe(true);
      expect(fs.existsSync(`${imageStemPath}.avif`)).toBe(true);
    });

    // Check that image was added to db
    const imageId = response.text;
    expect(imageId).toBeDefined();
    const [image] = await queryRunner.query(
      `SELECT * FROM image WHERE id = '${imageId}'`,
    );
    expect(image.cragId).toEqual(mockData.crags.publishedCrag.id);
    expect(image.path).toEqual(`crags/${mockData.crags.publishedCrag.slug}`);
  });

  it('should succeed uploading a route image', async () => {
    const response = await request(app.getHttpServer())
      .post('/upload/image')
      .set('Authorization', `Bearer ${mockData.users.basicUser1.authToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field(
        'entityId',
        mockData.crags.publishedCrag.sectors.publishedSector.routes
          .publishedRoute.id,
      )
      .field('entityType', 'route')
      .field('title', 'An image of a route')
      .field('type', 'sketch')
      .field('description', 'This is this route')
      .attach('image', `${__dirname}/testImage.jpg`)
      .expect(201);

    // Check that newly generated image files exist
    const imagesPath = `${__dirname}/../../${env.STORAGE_PATH}/images`;
    const stem = `${mockData.crags.publishedCrag.slug}-${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.slug}`;

    expect(fs.existsSync(`${imagesPath}/routes/${stem}.jpg`)).toBe(true);
    sizes.forEach(size => {
      const imageStemPath = `${imagesPath}/${size}/routes/${stem}`;
      expect(fs.existsSync(`${imageStemPath}.jpg`)).toBe(true);
      expect(fs.existsSync(`${imageStemPath}.webp`)).toBe(true);
      expect(fs.existsSync(`${imageStemPath}.avif`)).toBe(true);
    });

    // Check that image was added to db
    const imageId = response.text;
    expect(imageId).toBeDefined();
    const [image] = await queryRunner.query(
      `SELECT * FROM image WHERE id = '${imageId}'`,
    );
    expect(image.routeId).toEqual(
      mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute
        .id,
    );
    expect(image.path).toEqual(
      `routes/${mockData.crags.publishedCrag.slug}-${mockData.crags.publishedCrag.sectors.publishedSector.routes.publishedRoute.slug}`,
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
