import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingsModule } from 'src/bookings/bookings.module';
import { ArrivalFlow } from './arrival.flow';
import { BullModule } from '@nestjs/bullmq';
import { FLOW_ARRIVAL_PRODUCER, FLOW_ARRIVAL_QUEUE } from './constants';
import { LockCodeModule } from 'src/lock-code/lock-code.module';
import { SmsModule } from 'src/sms/sms.module';
import { MailModule } from 'src/mail/mail.module';
import { DirectusModule } from 'src/directus/directus.module';
import { LiquidModule } from 'src/liquid/liquid.module';
import { MongoIdModule } from 'src/pipes/mongo-id/mongo-id.module';
import { ArrivalProcessor } from './arrival.processor';
import { LockCodeProcessor } from './processors/lock-code.processor';
import { NotificationsProcessor } from './processors/notifications.processor';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerFlowProducer({
      name: FLOW_ARRIVAL_PRODUCER,
    }),
    BullModule.registerQueue({
      name: FLOW_ARRIVAL_QUEUE,
    }),
    BookingsModule,
    DirectusModule,
    LockCodeModule,
    SmsModule,
    MailModule,
    LiquidModule,
    MongoIdModule,
  ],
  providers: [
    ArrivalFlow,
    ArrivalProcessor,
    LockCodeProcessor,
    NotificationsProcessor,
  ],
  exports: [ArrivalFlow],
})
export class ArrivalModule {}
