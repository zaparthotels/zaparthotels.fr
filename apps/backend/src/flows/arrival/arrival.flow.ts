import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IFlow } from '../interfaces/IFlow';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BookingDto } from 'src/bookings/dto/booking.dto';
import {
  FLOW_ARRIVAL_LOCK_CODE_QUEUE,
  FLOW_ARRIVAL_NOTIFICATIONS_QUEUE,
} from './constants';

@Injectable()
export class ArrivalFlow implements IFlow {
  private readonly logger = new Logger(ArrivalFlow.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue(FLOW_ARRIVAL_LOCK_CODE_QUEUE)
    private flowArrivalLockCodeQueue: Queue,
    @InjectQueue(FLOW_ARRIVAL_NOTIFICATIONS_QUEUE)
    private flowArrivalNotificationsQueue: Queue,
  ) {}

  async run(booking: BookingDto) {
    const bookingId = booking._id.toString();

    this.flowArrivalLockCodeQueue.remove(bookingId);
    this.flowArrivalLockCodeQueue.add('arrival', bookingId, {
      jobId: bookingId,
      delay: 1,
    });

    this.flowArrivalNotificationsQueue.remove(bookingId);
    this.flowArrivalNotificationsQueue.add('arrival', bookingId, {
      jobId: bookingId,
      delay: 10000,
    });
  }
}
