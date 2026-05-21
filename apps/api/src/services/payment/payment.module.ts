import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PaymentService } from './payment.service';
import { MockPaymentProvider } from './mock.payment.provider';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: PaymentService, useClass: MockPaymentProvider }],
  exports: [PaymentService],
})
export class PaymentModule {}
