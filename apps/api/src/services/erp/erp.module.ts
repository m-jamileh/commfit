import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ERPService } from './erp.service';
import { MockERPProvider } from './mock.erp.provider';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: ERPService, useClass: MockERPProvider }],
  exports: [ERPService],
})
export class ERPModule {}
