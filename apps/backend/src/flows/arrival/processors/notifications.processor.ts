import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { TBookingStatus } from '@zaparthotels/types';
import { Job } from 'bullmq';
import { BookingsService } from 'src/bookings/bookings.service';
import { DirectusService } from 'src/directus/directus.service';
import { LiquidService } from 'src/liquid/liquid.service';
import { MailService } from 'src/mail/mail.service';
import { MongoIdPipe } from 'src/pipes/mongo-id/mongo-id.pipe';
import { SmsService } from 'src/sms/sms.service';
import { FLOW_ARRIVAL_NOTIFICATIONS_QUEUE } from '../constants';

@Processor(FLOW_ARRIVAL_NOTIFICATIONS_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly bookingService: BookingsService,
    private readonly directusService: DirectusService,
    private readonly smsService: SmsService,
    private readonly mailService: MailService,
    private readonly liquidService: LiquidService,
    private readonly mongoIdPipe: MongoIdPipe,
  ) {
    super();
  }

  async process(job: Job<string>): Promise<void> {
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

    this.liquidService.setLocale(booking.guest.locale);

    if (!booking.lockCode) {
      this.logger.error(
        `Booking ${job.data} has no lockCode generated, fallback to default.`,
      );

      booking.lockCode = {
        lockId: 'default',
        code: 'DIRECTUS_DEFAULT',
        startsAt: new Date(),
        expiresAt: new Date(),
      };
    }

    const directusProperty = await this.directusService.getPropertyById(
      booking.propertyId,
      await this.directusService.getCorrespondingLocale(booking.guest.locale),
    );

    if (!directusProperty) {
      this.logger.error(
        `Property ${booking.propertyId} not found in Directus.`,
      );
      throw new Error(`Property ${booking.propertyId} not found in Directus.`);
    }

    const context = { booking };

    const message = await this.liquidService.parseAndRender(
      directusProperty.translations[0].notification,
      context,
    );

    const subject = await this.liquidService.parseAndRender(
      directusProperty.translations[0].subject,
      context,
    );

    await this.smsService.sendSms({
      phoneNumber: booking.guest.phone,
      message,
    });

    await this.mailService.sendMail({
      recipient: booking.guest.email,
      subject,
      body: message,
    });

    this.logger.log(
      `Job ${job.id}. Attempt ${job.attemptsMade + 1}. Sending SMS and Mail to ${booking.guest.phone} succeded.`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id}. Arrival flow executed successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.log(
      `Job ${job.id}. Failed to run arrival flow ${error.message}.`,
    );
  }
}
