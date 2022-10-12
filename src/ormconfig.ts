import * as dotenv from 'dotenv';
import { env } from 'process';
import { DataSource } from 'typeorm';

dotenv.config({ path: __dirname + '/../.env' });

export default new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: 5432,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: false,
  migrationsTableName: 'migration',
  entities: ['src/**/entities/*.ts'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
});
