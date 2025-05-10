import { Injectable, Logger } from '@nestjs/common';
import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { FlowProducer, Queue } from 'bullmq';
import { BookingDto } from 'src/bookings/dto/booking.dto';
import {
  FLOW_ARRIVAL_LOCK_CODE_QUEUE,
  FLOW_ARRIVAL_NOTIFICATIONS_QUEUE,
  FLOW_ARRIVAL_PRODUCER,
  FLOW_ARRIVAL_QUEUE,
} from './constants';
import { TBookingStatus, TFlowStatus } from '@zaparthotels/types';
import { DirectusService } from 'src/directus/directus.service';
import { DateUtils } from 'src/utils/DateUtils';
import { IFlow } from '../interfaces/IFlow';
import { BookingsService } from 'src/bookings/bookings.service';

@Injectable()
export class ArrivalFlow implements IFlow {
  private readonly logger = new Logger(ArrivalFlow.name);

  constructor(
    @InjectFlowProducer(FLOW_ARRIVAL_PRODUCER)
    private readonly flowArrivalProducer: FlowProducer,
    @InjectQueue(FLOW_ARRIVAL_QUEUE)
    private readonly flowArrivalQueue: Queue,
    private readonly directusService: DirectusService,
    private readonly bookingService: BookingsService,
  ) {}

  async run(booking: BookingDto) {
    const bookingId = booking._id.toString();
    await this.flowArrivalQueue.remove(bookingId);

    if (booking.status !== TBookingStatus.CONFIRMED) {
      this.logger.warn('Booking is not confirmed.');
      return;
    }

    const existingFlow = await this.bookingService.getFlowByName(
      booking,
      ArrivalFlow.name,
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

    const { arrivalNotificationTime } = directusProperty;

    const now = new Date();

    const notificationsTimestamp = new DateUtils(booking.dates.checkIn);
    notificationsTimestamp.setTimeFromString(arrivalNotificationTime);

    await this.flowArrivalProducer.add({
      name: 'flow-arrival_completed',
      queueName: FLOW_ARRIVAL_QUEUE,
      data: { bookingId, status: TFlowStatus.COMPLETED },
      opts: {
        jobId: bookingId,
      },
      children: [
        {
          name: 'notifications',
          queueName: FLOW_ARRIVAL_NOTIFICATIONS_QUEUE,
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
              name: 'lock-code',
              queueName: FLOW_ARRIVAL_LOCK_CODE_QUEUE,
              data: bookingId,
              opts: {
                attempts: 1,
                removeDependencyOnFailure: true,
                backoff: {
                  type: 'exponential',
                  delay: 10000,
                },
              },
              children: [
                {
                  name: 'flow-arrival_running',
                  queueName: FLOW_ARRIVAL_QUEUE,
                  data: { bookingId, status: TFlowStatus.RUNNING },
                  opts: {
                    delay: notificationsTimestamp.getTime() - now.getTime(),
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    await this.bookingService.addFlow(booking, {
      name: ArrivalFlow.name,
      status: TFlowStatus.PENDING,
    });
  }
}
