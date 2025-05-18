import { Module } from '@nestjs/common';
import { BookingsModule } from 'src/bookings/bookings.module';
import { DepartureFlow } from './departure.flow';
import { BullModule } from '@nestjs/bullmq';
import { FLOW_DEPARTURE_PRODUCER, FLOW_DEPARTURE_QUEUE } from './constants';
import { SmsModule } from 'src/sms/sms.module';
import { MessageModule } from 'src/message/message.module';
import { DirectusModule } from 'src/directus/directus.module';
import { LiquidModule } from 'src/liquid/liquid.module';
import { MongoIdModule } from 'src/pipes/mongo-id/mongo-id.module';
import { DepartureProcessor } from './departure.processor';
import { NotificationsProcessor } from './processors/notifications.processor';

@Module({
  imports: [
    BullModule.registerFlowProducer({
      name: FLOW_DEPARTURE_PRODUCER,
    }),
    BullModule.registerQueue({
      name: FLOW_DEPARTURE_QUEUE,
    }),
    BookingsModule,
    DirectusModule,
    SmsModule,
    MessageModule,
    LiquidModule,
    MongoIdModule,
  ],
  providers: [DepartureFlow, DepartureProcessor, NotificationsProcessor],
  exports: [DepartureFlow],
})
export class DepartureModule {}
