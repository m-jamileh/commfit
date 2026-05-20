import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EmailService } from './email.service';
import { MockEmailProvider } from './mock.email.provider';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: EmailService, useClass: MockEmailProvider }],
  exports: [EmailService],
})
export class EmailModule {}
