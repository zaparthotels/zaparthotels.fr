import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { IMessage } from '@zaparthotels/types';
import { MESSAGE_QUEUE } from './constants';

@Injectable()
export class MessageService {
  constructor(@InjectQueue(MESSAGE_QUEUE) private messageQueue: Queue) {}

  async sendMessage(message: IMessage): Promise<Job<IMessage>> {
    return this.messageQueue.add('send-message', message);
  }
}
