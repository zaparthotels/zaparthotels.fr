import { Injectable, Logger } from '@nestjs/common';
import {
  InjectQueue,
  Processor,
  OnWorkerEvent,
  WorkerHost,
} from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { ISms } from '@zaparthotels/types';
import SmsClient from 'android-sms-gateway';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Processor('sms-queue')
export class SmsService extends WorkerHost {
  private readonly logger = new Logger(SmsService.name);
  // TODO: replace with nest HttpModule and axios
  private readonly smsCLient = new SmsClient(
    this.configService.get<string>('SMS_LOGIN'),
    this.configService.get<string>('SMS_PASSWORD'),
    {
      get: async (url, headers) => {
        const response = await fetch(url, { method: 'GET', headers });
        return response.json();
      },
      post: async (url, body, headers) => {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
        return response.json();
      },
      delete: async (url, headers) => {
        const response = await fetch(url, { method: 'DELETE', headers });
        return response.json();
      },
    },
    this.configService.get<string>('SMS_BASE_URL'),
  );

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('sms-queue') private smsQueue: Queue,
  ) {
    super();
  }

  async sendSms(phoneNumber: string, message: string): Promise<Job<ISms>> {
    return this.smsQueue.add('send-sms', {
      phoneNumber,
      message,
    });
  }

  async process(job: Job<ISms>): Promise<void> {
    const { phoneNumber, message } = job.data;
    this.logger.log(
      `Job ${job.id}. Attempt ${job.attemptsMade + 1}. Sending SMS to ${phoneNumber}: "${message}"`,
    );

    await this.smsCLient.send({
      phoneNumbers: [phoneNumber],
      message,
      ttl: 35,
    });
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
