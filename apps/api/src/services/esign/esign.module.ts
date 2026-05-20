import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ESignService } from './esign.service';
import { MockESignProvider } from './mock.esign.provider';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: ESignService, useClass: MockESignProvider }],
  exports: [ESignService],
})
export class ESignModule {}
