import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { WarrantyService } from './warranty.service';
import { MockWarrantyProvider } from './mock.warranty.provider';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: WarrantyService, useClass: MockWarrantyProvider }],
  exports: [WarrantyService],
})
export class WarrantyModule {}
