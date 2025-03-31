import { Module } from '@nestjs/common';
import { BookingsModule } from 'src/bookings/bookings.module';
import { WebhooksController } from './webhooks.controller';
import { FlowsModule } from 'src/flows/flows.module';

@Module({
  imports: [BookingsModule, FlowsModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
