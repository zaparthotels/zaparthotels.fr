import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ILockCode } from '@zaparthotels/types';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { firstValueFrom, catchError, retry } from 'rxjs';
import { TokenResponseDto } from './dto/token-response.dto';
import { LockCodeResponseDto } from './dto/lock-code-response.dto';

@Injectable()
export class LockCodeService {
  private readonly logger = new Logger(LockCodeService.name);
  private readonly IGLOOHOME_BASE_URL =
    'https://api.igloodeveloper.co/igloohome';

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  private async getToken(): Promise<string> {
    const RETRY_COUNT = 3;
    const url = 'https://auth.igloohome.co/oauth2/token';

    const cacheKey = 'IGLOOHOME_TOKEN';
    let token = await this.cacheManager.get<string>(cacheKey);

    if (!token) {
      const credentials = this.configService.get<string>(
        'IGLOOHOME_CREDENTIALS',
      );

      const headers = {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      const response = await firstValueFrom(
        this.httpService
          .post<TokenResponseDto>(url, null, {
            headers,
            params: {
              grant_type: 'client_credentials',
            },
          })
          .pipe(
            retry(RETRY_COUNT),
            catchError((error) => {
              this.logger.error('Error fetching token', error.message);
              throw error;
            }),
          ),
      );

      const tokenData = plainToInstance(TokenResponseDto, response.data);

      const errors = await validate(tokenData);
      if (errors.length) {
        this.logger.error(`Invalid token response: ${JSON.stringify(errors)}`);
        throw new Error('Invalid token response format');
      }

      token = tokenData.access_token;
      const expiresIn = tokenData.expires_in;

      await this.cacheManager.set(cacheKey, token, expiresIn);
    }

    return token;
  }

  async create(lockCode: ILockCode): Promise<ILockCode> {
    const RETRY_COUNT = 3;
    const url = `${this.IGLOOHOME_BASE_URL}/devices/${lockCode.lockId}/algopin/hourly`;

    const headers = {
      Authorization: `Bearer ${await this.getToken()}`,
      'Content-Type': 'application/json',
    };

    const body = {
      variance: 1,
      startDate: `${lockCode.startsAt.toISOString().split('.')[0]}Z`,
      endDate: `${lockCode.expiresAt.toISOString().split('.')[0]}Z`,
      accessName: 'Guest',
    };

    const response = await firstValueFrom(
      this.httpService.post<LockCodeResponseDto>(url, body, { headers }).pipe(
        retry(RETRY_COUNT),
        catchError((error) => {
          this.logger.error('Error when creating lock code', error.message);
          throw error;
        }),
      ),
    );

    const lockCodeData = plainToInstance(LockCodeResponseDto, response.data);

    const errors = await validate(lockCodeData);
    if (errors.length) {
      this.logger.error(
        `Invalid lock code response: ${JSON.stringify(errors)}`,
      );
      throw new Error('Invalid lock code response format');
    }

    return {
      code: lockCodeData.pin,
      ...lockCode,
    };
  }
}
