import { Module } from '@nestjs/common';
import { BookingsModule } from 'src/bookings/bookings.module';
import { WebhooksController } from './webhooks.controller';
import { FlowsModule } from 'src/flows/flows.module';
import { Beds24Guard } from './guards/beds24.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [BookingsModule, FlowsModule, ConfigModule],
  controllers: [WebhooksController],
  providers: [Beds24Guard],
})
export class WebhooksModule {}
