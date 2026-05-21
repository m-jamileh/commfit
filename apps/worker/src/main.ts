import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JsonLogger } from './common/json-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new JsonLogger(),
    bufferLogs: true,
  });

  app.useLogger(new JsonLogger());
  app.setGlobalPrefix('v1');

  const port = process.env.WORKER_PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
}

bootstrap();
