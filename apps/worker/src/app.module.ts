import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { EmailDispatchProcessor } from './processors/email-dispatch.processor';
import { CommissionRecomputeProcessor } from './processors/commission-recompute.processor';
import { AuditAsyncProcessor } from './processors/audit-async.processor';
import { ScheduledPmRolloverProcessor } from './processors/scheduled-pm-rollover.processor';
import { RecurringAutopaySimulationProcessor } from './processors/recurring-autopay-simulation.processor';
import { QUEUE_NAMES } from './queues';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    BullModule.forRoot({ connection: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' } }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.EMAIL_DISPATCH },
      { name: QUEUE_NAMES.COMMISSION_RECOMPUTE },
      { name: QUEUE_NAMES.AUDIT_ASYNC },
      { name: QUEUE_NAMES.SCHEDULED_PM_ROLLOVER },
      { name: QUEUE_NAMES.RECURRING_AUTOPAY_SIMULATION },
    ),
    DatabaseModule,
    HealthModule,
  ],
  providers: [
    EmailDispatchProcessor,
    CommissionRecomputeProcessor,
    AuditAsyncProcessor,
    ScheduledPmRolloverProcessor,
    RecurringAutopaySimulationProcessor,
  ],
})
export class AppModule {}
