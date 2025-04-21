import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  InjectQueue,
  Processor,
  OnWorkerEvent,
  WorkerHost,
} from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { IBooking, ILockCode } from '@zaparthotels/types';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { catchError } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { TokenResponseDto } from './dto/tokenResponse.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SMARTLOCK_QUEUE } from './constants';

@Injectable()
@Processor(SMARTLOCK_QUEUE)
export class LockCodeProcessor extends WorkerHost {
  private readonly logger = new Logger(LockCodeProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue(SMARTLOCK_QUEUE) private lockCodeQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super();
  }

  async process(job: Job<ILockCode>): Promise<void> {
    // process
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id}. Lock Code retrieved successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.log(
      `Job ${job.id}. Failed to retrieve Lock Code, with error ${error.message}.`,
    );
  }
}
