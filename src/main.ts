import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';

let serverOptions: any = { cors: true };

if (process.env.SSL_CERT != null) {
  const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_CERT_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT),
  };

  serverOptions = { cors: true, httpsOptions };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, serverOptions);
  app.useGlobalPipes(new ValidationPipe());
  const PORT = Number(process.env.PORT) || 3000;
  await app.listen(PORT);
}
bootstrap();
