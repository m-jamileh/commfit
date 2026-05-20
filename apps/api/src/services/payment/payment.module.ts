import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Module({
  providers: [],
  exports: [PaymentService],
})
export class PaymentModule {}
