import { Injectable, Logger } from '@nestjs/common';
import {
  InjectQueue,
  Processor,
  OnWorkerEvent,
  WorkerHost,
} from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { SmsService } from 'src/sms/sms.service';
import { MailService } from 'src/mail/mail.service';
import { BookingDocument } from '../schemas/booking.schema';
import { EBookingNotification } from '@zaparthotels/types';

@Injectable()
@Processor('notifications-queue')
export class NotificationsService extends WorkerHost {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue('notifications-queue') private notificationsQueue: Queue,
    private readonly smsService: SmsService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async scheduleNotification(
    booking: BookingDocument,
  ): Promise<Job<BookingDocument>> {
    return this.notificationsQueue.add(
      EBookingNotification.WELCOME_CODE,
      booking,
      {
        // delay:
        //   // booking.dates.checkIn.getTime() -
        //   // 45 * 60 * 1000 -
        //   new Date().getTime(),
      },
    );
  }

  async process(job: Job<BookingDocument>): Promise<void> {
    const booking = job.data;
    const type = job.name;

    switch (type) {
      case EBookingNotification.WELCOME_CODE:
        this.handleWelcomeCode(booking);
        break;
      default:
        return;
    }

    this.logger.log(
      `Job ${job.id}. Attempt ${job.attemptsMade + 1}. Sending notifications.`,
    );
  }

  private async handleWelcomeCode(booking: BookingDocument) {
    await this.mailService.sendMail({
      recipient: 'leoplanus29@mcb29.fr',
      subject: 'Test de mail',
      body: 'Tu as compris, on teste des trucs',
    });

    await this.smsService.sendSms('+33637056203', 'Test de sms final');
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id}. SMS sent successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.log(
      `Job ${job.id}. Failed to send SMS, with error ${error.message}.`,
    );
  }
}
