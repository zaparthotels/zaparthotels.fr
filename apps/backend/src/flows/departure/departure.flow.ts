import { Injectable, Logger } from '@nestjs/common';
import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { FlowProducer, Queue } from 'bullmq';
import { BookingDto } from 'src/bookings/dto/booking.dto';
import {
  FLOW_DEPARTURE_NOTIFICATIONS_QUEUE,
  FLOW_DEPARTURE_PRODUCER,
  FLOW_DEPARTURE_QUEUE,
} from './constants';
import { TBookingStatus, TFlowStatus } from '@zaparthotels/types';
import { DirectusService } from 'src/directus/directus.service';
import { DateUtils } from 'src/utils/DateUtils';
import { IFlow } from '../interfaces/IFlow';
import { BookingsService } from 'src/bookings/bookings.service';

@Injectable()
export class DepartureFlow implements IFlow {
  private readonly logger = new Logger(DepartureFlow.name);

  constructor(
    @InjectFlowProducer(FLOW_DEPARTURE_PRODUCER)
    private readonly flowDepartureProducer: FlowProducer,
    @InjectQueue(FLOW_DEPARTURE_QUEUE)
    private readonly flowDepartureQueue: Queue,
    private readonly directusService: DirectusService,
    private readonly bookingService: BookingsService,
  ) {}

  async run(booking: BookingDto) {
    const bookingId = booking._id.toString();
    await this.flowDepartureQueue.remove(bookingId);

    if (booking.status !== TBookingStatus.CONFIRMED) {
      this.logger.warn('Booking is not confirmed.');
      return;
    }

    const existingFlow = await this.bookingService.getFlowByName(
      booking,
      DepartureFlow.name,
    );

    if (existingFlow && existingFlow.status === TFlowStatus.COMPLETED) {
      this.logger.warn('Flow already completed.');
      return;
    }

    if (existingFlow && existingFlow.status === TFlowStatus.RUNNING) {
      this.logger.warn('Flow is running.');
      return;
    }

    const directusProperty = await this.directusService.getPropertyById(
      booking.propertyId,
    );

    const { departureNotificationTime } = directusProperty;

    const now = new Date();

    const notificationsTimestamp = new DateUtils(booking.dates.checkOut);
    notificationsTimestamp.setTimeFromString(departureNotificationTime);

    await this.flowDepartureProducer.add({
      name: 'flow-departure_completed',
      queueName: FLOW_DEPARTURE_QUEUE,
      data: { bookingId, status: TFlowStatus.COMPLETED },
      opts: {
        jobId: bookingId,
      },
      children: [
        {
          name: 'notifications',
          queueName: FLOW_DEPARTURE_NOTIFICATIONS_QUEUE,
          data: bookingId,
          opts: {
            attempts: 7,
            backoff: {
              type: 'exponential',
              delay: 10000,
            },
          },
          children: [
            {
              name: 'flow-departure_running',
              queueName: FLOW_DEPARTURE_QUEUE,
              data: { bookingId, status: TFlowStatus.RUNNING },
              opts: {
                delay: notificationsTimestamp.getTime() - now.getTime(),
              },
            },
          ],
        },
      ],
    });

    await this.bookingService.addFlow(booking, {
      name: DepartureFlow.name,
      status: TFlowStatus.PENDING,
    });
  }
}
