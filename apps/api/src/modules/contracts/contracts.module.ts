import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { DatabaseModule } from '../../database/database.module';
import { ESignModule } from '../../services/esign/esign.module';

@Module({
  imports: [DatabaseModule, ESignModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
