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
export class SmartlockProducerService {
  private readonly logger = new Logger(LockCodeService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue(SMARTLOCK_QUEUE) private lockCodeQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
    private readonly IGLOOHOME_AUTH_ENDPOINT: string = 'https://auth.igloohome.co/oauth2/token',
    private readonly IGLOOHOME_BASE_URL: string = 'https://api.igloodeveloper.co/igloohome',
  ) {
    super();
  }

  async addJob({ phoneNumber, message }: ISms): Promise<Job<ISms>> {
    return this.smsQueue.add('send-sms', {
      phoneNumber,
      message,
    });
  }
}
