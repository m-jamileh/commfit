import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Comm-Fit API')
    .setDescription('Comm-Fit Service — field-service automation platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/openapi', app, document, {
    jsonDocumentUrl: 'v1/openapi.json',
  });

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);
  logger.log(`API running on port ${port}`);
}

bootstrap();
