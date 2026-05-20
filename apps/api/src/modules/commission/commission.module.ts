import { Module } from '@nestjs/common';
import { CommissionController } from './commission.controller';
import { CommissionService } from './commission.service';
import { CommissionEngineService } from './commission-engine.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CommissionController],
  providers: [CommissionService, CommissionEngineService],
  exports: [CommissionService, CommissionEngineService],
})
export class CommissionModule {}
