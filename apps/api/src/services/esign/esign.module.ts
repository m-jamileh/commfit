import { Module } from '@nestjs/common';
import { ESignService } from './esign.service';

@Module({
  providers: [],
  exports: [ESignService],
})
export class ESignModule {}
