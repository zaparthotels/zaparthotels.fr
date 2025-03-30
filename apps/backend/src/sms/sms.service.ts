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
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
@Processor('sms-queue')
export class SmsService extends WorkerHost {
  private readonly logger = new Logger(SmsService.name);
  private readonly smsCLient = new SmsClient(
    this.configService.get<string>('SMS_LOGIN'),
    this.configService.get<string>('SMS_PASSWORD'),
    {
      get: async (url, headers) => {
        const response = await firstValueFrom(
          this.httpService.get(url, { headers }),
        );
        return response.data;
      },
      post: async (url, body, headers) => {
        const response = await firstValueFrom(
          this.httpService.post(url, JSON.stringify(body), { headers }),
        );
        return response.data;
      },
      delete: async (url, headers) => {
        const response = await firstValueFrom(
          this.httpService.delete(url, { headers }),
        );
        return response.data;
      },
    },
    this.configService.get<string>('SMS_BASE_URL'),
  );

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('sms-queue') private smsQueue: Queue,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async sendSms({ phoneNumber, message }: ISms): Promise<Job<ISms>> {
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
