import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  FLOW_ARRIVAL_LOCK_CODE_QUEUE,
  FLOW_ARRIVAL_NOTIFICATIONS_QUEUE,
} from './constants';
import { LockCodeService } from 'src/lock-code/lock-code.service';
import { SmsService } from 'src/sms/sms.service';
import { MailService } from 'src/mail/mail.service';
import { BookingsService } from 'src/bookings/bookings.service';

@Processor(FLOW_ARRIVAL_LOCK_CODE_QUEUE)
export class ArrivalLockCodeProcessor extends WorkerHost {
  private readonly logger = new Logger(ArrivalLockCodeProcessor.name);

  constructor(
    private readonly bookingService: BookingsService,
    private readonly lockCodeService: LockCodeService,
  ) {
    super();
  }

  async process(job: Job<string>): Promise<void> {
    const booking = await this.bookingService.findOne(job.data);

    if (!booking) {
      this.logger.error(`Booking ${job.data} not found.`);
      throw new Error(`Booking ${job.data} not found.`);
    }

    const { checkIn, checkOut } = booking.dates;
    const lockId = 'IGK3091f9efe';
    // TODO: déduire lock depuis booking + Directus

    const startsAt = new Date(checkIn);
    startsAt.setHours(startsAt.getHours() + 1);

    const expiresAt = new Date(checkOut);
    expiresAt.setHours(expiresAt.getHours() - 1);

    const lockCode = await this.lockCodeService.create({
      lockId,
      startsAt,
      expiresAt,
    });

    this.bookingService.createOrUpdate({
      additionalProperties: {
        lockCodes: [lockCode],
      },
      ...booking,
    });
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

@Processor(FLOW_ARRIVAL_NOTIFICATIONS_QUEUE)
export class ArrivalNotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(ArrivalNotificationsProcessor.name);

  constructor(
    private readonly bookingService: BookingsService,
    private readonly smsService: SmsService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async process(job: Job<string>): Promise<void> {
    const booking = await this.bookingService.findOne(job.data);

    if (!booking) {
      this.logger.error(`Booking ${job.data} not found.`);
      throw new Error(`Booking ${job.data} not found.`);
    }

    this.smsService.sendSms({
      phoneNumber: booking.guest.phone,
      message: `Hello ${booking.guest.firstName}, your booking is confirmed! ${booking.additionalProperties.lockCodes[0].code}`,
    });

    this.mailService.sendMail({
      recipient: booking.guest.email,
      subject: 'Booking Confirmation',
      body: `Hello ${booking.guest.firstName}, your booking is confirmed! ${booking.additionalProperties.lockCodes[0].code}`,
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
