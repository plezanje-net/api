import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as fs from 'fs';

let serverOptions: any = { cors: true };

if (process.env.SSL_CERT != null) {
  const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_CERT_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT),
  };

  serverOptions = { https: httpsOptions };
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(serverOptions),
  );
  app.useGlobalPipes(new ValidationPipe());
  const PORT = Number(process.env.PORT) || 3000;
  await app.listen(PORT);
}
bootstrap();
