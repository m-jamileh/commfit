import { Module } from '@nestjs/common';

// Bull-Board queue adapters will be registered here in M3 as BullMQ queues are defined.
// The Bull-Board UI is already mounted at /v1/admin/bull-board via AppModule.
@Module({})
export class AdminBullBoardModule {}
