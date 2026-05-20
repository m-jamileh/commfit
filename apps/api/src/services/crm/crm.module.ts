import { Module } from '@nestjs/common';
import { CRMService } from './crm.service';

@Module({
  providers: [],
  exports: [CRMService],
})
export class CRMModule {}
