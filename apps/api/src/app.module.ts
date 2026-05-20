import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { HealthModule } from './health/health.module';
import { AdminBullBoardModule } from './admin/bull-board.module';
import { AdminAuthMiddleware } from './admin/admin-auth.middleware';
import { DatabaseModule } from './database/database.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { AccountsModule } from './modules/accounts/accounts.module';
import { LocationsModule } from './modules/locations/locations.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { TechniciansModule } from './modules/technicians/technicians.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CommissionModule } from './modules/commission/commission.module';
import { PartsModule } from './modules/parts/parts.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { EmailModule } from './services/email/email.module';
import { PaymentModule } from './services/payment/payment.module';
import { ESignModule } from './services/esign/esign.module';
import { WarrantyModule } from './services/warranty/warranty.module';
import { ERPModule } from './services/erp/erp.module';
import { CRMModule } from './services/crm/crm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL ?? 'redis://localhost:6379',
      },
    }),
    BullModule.registerQueue({ name: 'audit-async' }),
    BullBoardModule.forRoot({
      route: '/admin/bull-board',
      adapter: ExpressAdapter,
    }),
    DatabaseModule,
    HealthModule,
    AdminBullBoardModule,
    AccountsModule,
    LocationsModule,
    EquipmentModule,
    TechniciansModule,
    JobsModule,
    QuotesModule,
    ContractsModule,
    InvoicesModule,
    PaymentsModule,
    CommissionModule,
    PartsModule,
    ReportsModule,
    NotificationsModule,
    AuditModule,
    WebhooksModule,
    EmailModule,
    PaymentModule,
    ESignModule,
    WarrantyModule,
    ERPModule,
    CRMModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AdminAuthMiddleware).forRoutes('/v1/admin/bull-board(.*)');
  }
}
