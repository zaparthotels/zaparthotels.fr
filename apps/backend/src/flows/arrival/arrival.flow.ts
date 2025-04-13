import { Injectable, Logger } from '@nestjs/common';
import { IFlow } from '../interfaces/IFlow';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BookingDto } from 'src/bookings/dto/booking.dto';
import {
  FLOW_ARRIVAL_LOCK_CODE_QUEUE,
  FLOW_ARRIVAL_NOTIFICATIONS_QUEUE,
} from './constants';
import { TBookingStatus } from '@zaparthotels/types';
import { DirectusService } from 'src/directus/directus.service';
import { DateUtils } from 'src/utils/DateUtils';
import { BookingsService } from 'src/bookings/bookings.service';

@Injectable()
export class ArrivalFlow implements IFlow {
  private readonly logger = new Logger(ArrivalFlow.name);

  constructor(
    @InjectQueue(FLOW_ARRIVAL_LOCK_CODE_QUEUE)
    private flowArrivalLockCodeQueue: Queue,
    @InjectQueue(FLOW_ARRIVAL_NOTIFICATIONS_QUEUE)
    private flowArrivalNotificationsQueue: Queue,
    private readonly directusService: DirectusService,
    private readonly bookingService: BookingsService,
  ) {}

  private removeFlows(bookingId: string) {
    this.flowArrivalLockCodeQueue.remove(bookingId);
    this.flowArrivalNotificationsQueue.remove(bookingId);
  }

  async run(booking: BookingDto) {
    const bookingId = booking._id.toString();
    this.removeFlows(bookingId);

    if (booking.status !== TBookingStatus.CONFIRMED) {
      this.logger.warn('Booking is not confirmed.');
      return;
    }

    const directusProperty = await this.directusService.getPropertyById(
      booking.propertyId,
    );

    const { arrivalNotificationTime } = directusProperty;

    const notificationTimestamp = new DateUtils(booking.dates.checkIn);
    notificationTimestamp.setTimeFromString(arrivalNotificationTime);

    const lockCodeTimestamp = new DateUtils(notificationTimestamp);
    lockCodeTimestamp.setHours(lockCodeTimestamp.getHours() - 1);

    const currentTimestamp = new Date().getTime();

    await this.flowArrivalLockCodeQueue.add('arrival', bookingId, {
      jobId: bookingId,
      delay: lockCodeTimestamp.getTime() - currentTimestamp,
    });

    await this.flowArrivalNotificationsQueue.add('arrival', bookingId, {
      jobId: bookingId,
      delay: notificationTimestamp.getTime() - currentTimestamp,
    });

    await this.bookingService.update({
      ...booking,
    });
  }
}
