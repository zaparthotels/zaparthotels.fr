import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { IEmail } from '@zaparthotels/types';
import { MAIL_QUEUE } from './constants';

@Injectable()
export class MailService {
  constructor(@InjectQueue(MAIL_QUEUE) private mailQueue: Queue) {}

  async sendMail(email: IEmail): Promise<Job<IEmail>> {
    return this.mailQueue.add('send-mail', email);
  }
}
