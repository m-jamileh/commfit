import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { DatabaseModule } from '../../database/database.module';
import { PaymentModule } from '../../services/payment/payment.module';

@Module({
  imports: [DatabaseModule, PaymentModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
