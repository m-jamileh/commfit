import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CRMService } from './crm.service';
import { MockCRMProvider } from './mock.crm.provider';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: CRMService, useClass: MockCRMProvider }],
  exports: [CRMService],
})
export class CRMModule {}
