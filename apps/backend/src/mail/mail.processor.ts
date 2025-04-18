import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { MAIL_QUEUE } from './constants';
import * as nodemailer from 'nodemailer';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmail } from '@zaparthotels/types';
import { Job } from 'bullmq';

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);
  private readonly mailClient: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    super();
    this.mailClient = this.createMailClient();
  }

  private createMailClient(): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async process(job: Job<IEmail>): Promise<void> {
    const { recipient, subject, body } = job.data;
    this.logger.log(
      `Job ${job.id}. Attempt ${job.attemptsMade + 1}. Sending mail to ${recipient}.`,
    );

    await this.mailClient.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: recipient,
      bcc: this.configService.get<string>('MAIL_FWD'),
      subject,
      html: body.replace(/\n/g, '<br>'),
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id}. Mail sent successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.log(`Job ${job.id}. Failed to send mail, with error:`, error);
  }
}
