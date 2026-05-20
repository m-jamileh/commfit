import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  providers: [],
  exports: [EmailService],
})
export class EmailModule {}
