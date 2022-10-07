import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as fs from 'fs';
import { env } from 'process';
import fastifyMultipart from 'fastify-multipart';

let serverOptions: any = { cors: true };

if (env.SSL_CERT != null) {
  const httpsOptions = {
    key: fs.readFileSync(env.SSL_CERT_KEY),
    cert: fs.readFileSync(env.SSL_CERT),
  };

  serverOptions = { https: httpsOptions };
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(serverOptions),
  );
  app.useGlobalPipes(new ValidationPipe());

  app.register(fastifyMultipart, {
    // attachFieldsToBody: true,
    // attachFieldsToBody: 'keyValues', // TODO: if we manage to update to non-deprecated version, this will be possible --> could then use DTO and validation in controller
  });

  const PORT = Number(env.PORT) || 3000;
  await app.listen(PORT);
}
bootstrap();
