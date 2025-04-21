import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { SMS_QUEUE } from './constants';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISms } from '@zaparthotels/types';
import { Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import SmsClient from 'android-sms-gateway';

@Processor(SMS_QUEUE)
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name);
  private readonly smsClient: SmsClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    super();
    this.smsClient = this.createSmsClient();
  }

  private createSmsClient(): SmsClient {
    return new SmsClient(
      this.configService.getOrThrow<string>('SMS_LOGIN'),
      this.configService.getOrThrow<string>('SMS_PASSWORD'),
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
  }

  async process(job: Job<ISms>): Promise<void> {
    const { phoneNumber, message } = job.data;
    this.logger.log(
      `Job ${job.id}. Attempt ${job.attemptsMade + 1}. Sending SMS to ${phoneNumber}.`,
    );

    await this.smsClient.send({
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
    this.logger.log(`Job ${job.id}. Failed to send SMS, with error:`, error);
  }
}
