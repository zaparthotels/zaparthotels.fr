import { Injectable, Logger } from '@nestjs/common';
import {
  InjectQueue,
  Processor,
  OnWorkerEvent,
  WorkerHost,
} from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { IEmail } from '@zaparthotels/types';
import * as MailClient from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Processor('mail-queue')
export class MailService extends WorkerHost {
  private readonly logger = new Logger(MailService.name);
  private readonly mailClient = MailClient.createTransport({
    host: this.configService.get<string>('MAIL_HOST'),
    port: 465,
    secure: true,
    auth: {
      user: this.configService.get<string>('MAIL_USER'),
      pass: this.configService.get<string>('MAIL_PASSWORD'),
    },
  });

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('mail-queue') private mailQueue: Queue,
  ) {
    super();
  }

  async sendMail({ recipient, subject, body }: IEmail): Promise<Job<IEmail>> {
    return this.mailQueue.add('send-mail', {
      recipient,
      subject,
      body,
    });
  }

  async process(job: Job<IEmail>): Promise<void> {
    const { recipient, subject, body } = job.data;
    this.logger.log(
      `Job ${job.id}. Attempt ${job.attemptsMade + 1}. Sending mail to ${recipient}: "${subject}"`,
    );

    await this.mailClient.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: recipient,
      subject,
      html: body,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id}. Mail sent successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.log(
      `Job ${job.id}. Failed to send mail, with error ${error.message}.`,
    );
  }
}
