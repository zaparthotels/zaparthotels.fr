import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingsModule } from 'src/bookings/bookings.module';
import { ArrivalFlow } from './arrival.flow';
import { BullModule } from '@nestjs/bullmq';
import {
  FLOW_ARRIVAL_LOCK_CODE_QUEUE,
  FLOW_ARRIVAL_NOTIFICATIONS_QUEUE,
} from './constants';
import {
  ArrivalLockCodeProcessor,
  ArrivalNotificationsProcessor,
} from './arrival.processor';
import { LockCodeModule } from 'src/lock-code/lock-code.module';
import { SmsModule } from 'src/sms/sms.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue(
      {
        name: FLOW_ARRIVAL_LOCK_CODE_QUEUE,
        defaultJobOptions: {
          attempts: 7,
          backoff: {
            type: 'exponential',
            delay: 10000,
          },
        },
      },
      {
        name: FLOW_ARRIVAL_NOTIFICATIONS_QUEUE,
        defaultJobOptions: {
          attempts: 8,
          backoff: {
            type: 'exponential',
            delay: 10000,
          },
        },
      },
    ),
    BookingsModule,
    LockCodeModule,
    SmsModule,
    MailModule,
  ],
  providers: [
    ArrivalFlow,
    ArrivalLockCodeProcessor,
    ArrivalNotificationsProcessor,
  ],
  exports: [ArrivalFlow],
})
export class ArrivalModule {}
