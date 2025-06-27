import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { TBookingStatus } from '@zaparthotels/types';
import { Job } from 'bullmq';
import { BookingsService } from 'src/bookings/bookings.service';
import { DirectusService } from 'src/directus/directus.service';
import { LockCodeService } from 'src/lock-code/lock-code.service';
import { MongoIdPipe } from 'src/pipes/mongo-id/mongo-id.pipe';
import { FLOW_ARRIVAL_LOCK_CODE_QUEUE } from '../constants';

@Processor(FLOW_ARRIVAL_LOCK_CODE_QUEUE)
export class LockCodeProcessor extends WorkerHost {
  private readonly logger = new Logger(LockCodeProcessor.name);

  constructor(
    private readonly bookingService: BookingsService,
    private readonly directusService: DirectusService,
    private readonly lockCodeService: LockCodeService,
    private readonly mongoIdPipe: MongoIdPipe,
  ) {
    super();
  }

  async process(job: Job<string>): Promise<void> {
    const HOURS_OFFSET = 1;

    const booking = await this.bookingService.findOne(
      this.mongoIdPipe.transform(job.data),
    );

    if (!booking) {
      this.logger.error(`Booking ${job.data} not found.`);
      throw new Error(`Booking ${job.data} not found.`);
    }

    if (booking.status !== TBookingStatus.CONFIRMED) {
      this.logger.error(`Booking ${job.data} is not confirmed.`);
      throw new Error(`Booking ${job.data} is not confirmed.`);
    }

    const directusProperty = await this.directusService.getPropertyById(
      booking.propertyId,
    );

    if (!directusProperty) {
      this.logger.error(
        `Property ${booking.propertyId} not found in Directus.`,
      );
      throw new Error(`Property ${booking.propertyId} not found in Directus.`);
    }

    const { checkIn, checkOut } = booking.dates;
    const { locks } = directusProperty;

    const now = new Date();
    now.setMinutes(0, 0, 0);

    const startsAt = new Date(checkIn);
    startsAt.setMinutes(0, 0, 0);
    startsAt.setHours(startsAt.getHours() - HOURS_OFFSET);

    if (startsAt < now) {
      startsAt.setTime(now.getTime());
    }

    const expiresAt = new Date(checkOut);
    expiresAt.setHours(expiresAt.getHours() + HOURS_OFFSET);

    const lockCodes = await Promise.all(
      locks.map(({ lockId }) => {
        return this.lockCodeService.create({
          lockId,
          startsAt,
          expiresAt,
        });
      }),
    );

    await this.bookingService.update({
      ...booking,
      lockCodes,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id}. Arrival flow executed successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.log(`Job ${job.id}. Failed to run arrival flow:`, error);
  }
}
