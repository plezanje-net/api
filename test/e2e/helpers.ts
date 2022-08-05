import { Connection } from 'typeorm';
import * as fs from 'fs';

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

const initializeDbConn = async (app): Promise<Connection> => {
  const conn = app.get(Connection);

  const query = fs.readFileSync('./test/e2e/sql/init.sql', 'utf8');

  await conn.createQueryRunner().query(query);
  await conn.synchronize(true);

  return conn;
};

export { prepareEnvironment, initializeDbConn };
