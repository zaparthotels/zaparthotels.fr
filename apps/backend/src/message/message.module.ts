import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MessageService } from './message.service';
import { MESSAGE_QUEUE } from './constants';
import { MessageProcessor } from './message.processor';
import { Beds24Module } from 'src/beds24/beds24.module';

@Module({
  imports: [
    Beds24Module,
    BullModule.registerQueue({
      name: MESSAGE_QUEUE,
      defaultJobOptions: {
        attempts: 7,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    }),
  ],
  providers: [MessageService, MessageProcessor],
  exports: [MessageService],
})
export class MessageModule {}
