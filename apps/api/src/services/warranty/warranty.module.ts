import { Module } from '@nestjs/common';
import { WarrantyService } from './warranty.service';

@Module({
  providers: [],
  exports: [WarrantyService],
})
export class WarrantyModule {}
