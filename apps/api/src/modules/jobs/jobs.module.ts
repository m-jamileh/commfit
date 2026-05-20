import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseModule } from '../../database/database.module';
import { ESignModule } from '../../services/esign/esign.module';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({ name: 'audit-async' }),
    ESignModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
