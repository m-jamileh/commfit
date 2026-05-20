import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
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
  ],
})
export class AppModule {}
