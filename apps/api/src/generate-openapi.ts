/**
 * OpenAPI spec generation script.
 * Bootstraps NestJS with mocked external providers (Prisma, BullMQ queues)
 * so the spec can be generated without live infrastructure.
 *
 * Usage: ts-node -r tsconfig-paths/register src/generate-openapi.ts
 * Or:   pnpm --filter @commfit/api generate:openapi
 */
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { getQueueToken } from '@nestjs/bullmq';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma.service';

const QUEUE_NAMES = [
  'audit-async',
  'commission-recompute',
  'email-dispatch',
  'scheduled-pm-rollover',
  'recurring-autopay-simulation',
];

const mockQueue = {
  add: () => Promise.resolve({ id: 'mock' }),
  addBulk: () => Promise.resolve([]),
  close: () => Promise.resolve(),
  pause: () => Promise.resolve(),
  resume: () => Promise.resolve(),
  getJob: () => Promise.resolve(null),
};

const mockPrisma = new Proxy({} as PrismaService, {
  get(_target, prop: string) {
    if (prop === '$connect' || prop === '$disconnect') return () => Promise.resolve();
    return new Proxy(
      {},
      { get: () => () => Promise.resolve(null) },
    );
  },
});

async function generate(): Promise<void> {
  let testingModule = Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue(mockPrisma);

  for (const name of QUEUE_NAMES) {
    testingModule = testingModule
      .overrideProvider(getQueueToken(name))
      .useValue(mockQueue);
  }

  const moduleRef = await testingModule.compile();
  const app: INestApplication = moduleRef.createNestApplication();
  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
    .setTitle('Comm-Fit API')
    .setDescription('Comm-Fit Service v1 REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  await app.init();

  const outDir = resolve(__dirname, '../../../v1');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'openapi.json');
  writeFileSync(outPath, JSON.stringify(document, null, 2));

  process.stdout.write(`OpenAPI spec written to ${outPath}\n`);
  await app.close();
  process.exit(0);
}

generate().catch((err: unknown) => {
  process.stderr.write(`Failed to generate OpenAPI spec: ${String(err)}\n`);
  process.exit(1);
});
