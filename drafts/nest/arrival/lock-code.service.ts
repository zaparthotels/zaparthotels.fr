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

@Injectable()
export class LockCodeService {
  private readonly logger = new Logger(LockCodeService.name);

  constructor(
    private readonly configService: ConfigService,
      @InjectQueue(SMARTLOCK_QUEUE) private lockCodeQueue: Queue,
  ) {
    super();
  }

  async create() {
    // code
  }
}
















// import { Inject, Injectable, Logger } from '@nestjs/common';
// import {
//   InjectQueue,
//   Processor,
//   OnWorkerEvent,
//   WorkerHost,
// } from '@nestjs/bullmq';
// import { Queue, Job } from 'bullmq';
// import { IBooking, ILockCode } from '@zaparthotels/types';
// import { ConfigService } from '@nestjs/config';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { HttpService } from '@nestjs/axios';
// import { Cache } from 'cache-manager';
// import { catchError } from 'rxjs/operators';
// import { firstValueFrom } from 'rxjs';
// import { TokenResponseDto } from './dto/tokenResponse.dto';
// import { plainToInstance } from 'class-transformer';
// import { validate } from 'class-validator';

// @Injectable()
// @Processor('lock-code-queue')
// export class IglooService extends WorkerHost {
//   private readonly logger = new Logger(LockCodeService.name);

//   constructor(
//     private readonly configService: ConfigService,
//     @InjectQueue('lock-code-queue') private lockCodeQueue: Queue,
//     @Inject(CACHE_MANAGER) private cacheManager: Cache,
//     private readonly httpService: HttpService,
//     private readonly IGLOOHOME_AUTH_ENDPOINT: string = 'https://auth.igloohome.co/oauth2/token',
//     private readonly IGLOOHOME_BASE_URL: string = 'https://api.igloodeveloper.co/igloohome',
//   ) {
//     super();
//   }

//   async getToken(): Promise<string> {
//     const cacheKey = 'IGLOOHOME_TOKEN';
//     let token = await this.cacheManager.get<string>(cacheKey);

//     if (!token) {
//       const credentials = this.configService.get<string>(
//         'IGLOOHOME_CREDENTIALS',
//       );

//       const headers = {
//         Authorization: `Basic ${credentials}`,
//         'Content-Type': 'application/x-www-form-urlencoded',
//       };

//       const response = await firstValueFrom(
//         this.httpService
//           .post<TokenResponseDto>(this.IGLOOHOME_AUTH_ENDPOINT, null, {
//             headers,
//             params: {
//               grant_type: 'client_credentials',
//             },
//           })
//           .pipe(
//             catchError((error) => {
//               this.logger.error('Error fetching token', error.message);
//               throw error;
//             }),
//           ),
//       );

//       const tokenData = plainToInstance(TokenResponseDto, response.data);

//       const errors = await validate(tokenData);
//       if (errors.length > 0) {
//         this.logger.error(`Invalid token response: ${JSON.stringify(errors)}`);
//         throw new Error('Invalid token response format');
//       }

//       token = tokenData.access_token;
//       const expiresIn = tokenData.expires_in;

//       await this.cacheManager.set(cacheKey, token, expiresIn);
//     }

//     return token;
//   }

//   async createCode({
//     lockId,
//     startsAt,
//     expiresAt,
//   }: ILockCode): Promise<Job<ILockCode>> {
//     return this.lockCodeQueue.add('create-lock-code', {
//       lockId,
//       startsAt,
//       expiresAt,
//     });
//   }

//   async process(job: Job<ILockCode>): Promise<void> {
//     const { lockId, startsAt, expiresAt } = job.data;
//     this.logger.log(
//       `Job ${job.id}. Attempt ${job.attemptsMade + 1}. Retrieving lock code for ${lockId}, valid until ${expiresAt} hours`,
//     );

//     const token = await this.getToken();

//     const headers = {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     };

//     const body = {
//       lockId,
//       startsAt,
//       expiresAt,
//     };

//     const response = await firstValueFrom(
//       this.httpService
//         .post(`${this.IGLOOHOME_BASE_URL}/v2/locks/${lockId}/pins`, body, {
//           headers,
//         })
//         .pipe(
//           catchError((error) => {
//             this.logger.error('Error creating lock code', error.message);
//             throw error;
//           }),
//         ),
//     );

//     const code = response.data.pin;
//     const codeId = response.data.pinId;

//     const lockCode: ILockCode = {
//       lockId,
//       code,
//       codeId,
//       startsAt,
//       expiresAt,
//     };
//   }

//   @OnWorkerEvent('completed')
//   onCompleted(job: Job) {
//     this.logger.log(`Job ${job.id}. Lock Code retrieved successfully.`);
//   }

//   @OnWorkerEvent('failed')
//   onFailed(job: Job, error: Error) {
//     this.logger.log(
//       `Job ${job.id}. Failed to retrieve Lock Code, with error ${error.message}.`,
//     );
//   }
// }
