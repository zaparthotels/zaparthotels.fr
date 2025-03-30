import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SmsService } from './sms.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'sms-queue',
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
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
