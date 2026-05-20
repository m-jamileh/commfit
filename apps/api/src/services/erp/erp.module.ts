import { Module } from '@nestjs/common';
import { ERPService } from './erp.service';

@Module({
  providers: [],
  exports: [ERPService],
})
export class ERPModule {}
