import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { ISms } from '@zaparthotels/types';
import { SMS_QUEUE } from './constants';

@Injectable()
export class SmsService {
  constructor(@InjectQueue(SMS_QUEUE) private smsQueue: Queue) {}

  async sendSms(sms: ISms): Promise<Job<ISms>> {
    return this.smsQueue.add('send-sms', sms);
  }
}
