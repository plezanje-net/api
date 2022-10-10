import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import { env } from 'process';

let serverOptions: any = { cors: true };

if (env.SSL_CERT != null) {
  const httpsOptions = {
    key: fs.readFileSync(env.SSL_CERT_KEY),
    cert: fs.readFileSync(env.SSL_CERT),
  };

  serverOptions = { https: httpsOptions };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, serverOptions);
  app.useGlobalPipes(new ValidationPipe());
  const PORT = Number(env.PORT) || 3000;
  await app.listen(PORT);
}
bootstrap();
