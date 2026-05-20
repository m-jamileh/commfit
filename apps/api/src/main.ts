import './instrument';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { JsonLogger } from './common/json-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new JsonLogger(),
    bufferLogs: true,
  });

  app.useLogger(new JsonLogger());
  app.setGlobalPrefix('v1');
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Comm-Fit API')
    .setDescription('Comm-Fit Service v1 REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/docs', app, document);
  // Expose raw OpenAPI JSON for api-client generation
  app.getHttpAdapter().get('/v1/openapi.json', (_req, res) => {
    res.json(document);
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
