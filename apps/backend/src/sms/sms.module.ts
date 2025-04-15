import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SmsService } from './sms.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SMS_QUEUE } from './constants';
import { SmsProcessor } from './sms.processor';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: SMS_QUEUE,
      defaultJobOptions: {
        attempts: 7,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    }),
    HttpModule,
  ],
  providers: [SmsService, SmsProcessor],
  exports: [SmsService],
})
export class SmsModule {}
