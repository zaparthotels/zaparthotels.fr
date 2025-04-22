import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ILockCode } from '@zaparthotels/types';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { firstValueFrom, retry, catchError } from 'rxjs';
import { LockCodeResponseDto } from './dto/response/lock-code.dto';
import { TokenResponseDto } from './dto/response/token.dto';
import { Cache } from 'cache-manager';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class Beds24Service {
  private readonly logger = new Logger(Beds24Service.name);
  private readonly BEDS24_BASE_URL = 'https://beds24.com/api/v2';
  private readonly TOKEN_CACHE_KEY = 'BEDS24_TOKEN';

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  private async fetchAndCacheToken(): Promise<string> {
    const url = `${this.BEDS24_BASE_URL}/authentication/token`;
    const ttl = 15 * 24 * 60 * 60; // 15 days

    const headers = {
      refreshToken: this.configService.getOrThrow<string>(
        'BEDS24_REFRESH_TOKEN',
      ),
    };

    const response = await firstValueFrom(
      this.httpService
        .get<TokenResponseDto>(url, {
          headers,
        })
        .pipe(
          retry(3),
          catchError((error) => {
            this.logger.error('Error fetching token:', error);
            throw error;
          }),
        ),
    );

    const tokenData = plainToInstance(TokenResponseDto, response.data);
    const errors = await validate(tokenData);
    if (errors.length) {
      this.logger.error('Invalid token response:', errors);
      throw new Error('Invalid token response format');
    }

    const { token } = tokenData;
    await this.cacheManager.set(this.TOKEN_CACHE_KEY, token, ttl);
    return token;
  }

  @Cron('0 3 1,15 * *')
  private async getValidToken(forceRefresh = false): Promise<string> {
    if (forceRefresh) {
      return this.fetchAndCacheToken();
    }

    const cachedToken = await this.cacheManager.get<string>(
      this.TOKEN_CACHE_KEY,
    );
    return cachedToken || this.fetchAndCacheToken();
  }

  private async postWithAuth<T>(
    url: string,
    data: unknown,
    token: string,
  ): Promise<T> {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<T>(url, data, { headers }).pipe(retry(3)),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        this.logger.warn('Token expired or invalid, retrying with new token');
        const newToken = await this.getValidToken(true);
        return this.postWithAuth<T>(url, data, newToken);
      }
      this.logger.error('HTTP request failed', error);
      throw error;
    }
  }

  async create(lockCode: ILockCode): Promise<ILockCode> {
    const url = `${this.BEDS24_BASE_URL}/devices/${lockCode.lockId}/algopin/hourly`;

    const payload = {
      variance: 1,
      startDate: `${lockCode.startsAt.toISOString().split('.')[0]}Z`,
      endDate: `${lockCode.expiresAt.toISOString().split('.')[0]}Z`,
      accessName: 'Guest',
    };

    const token = await this.getValidToken();
    const responseData = await this.postWithAuth<LockCodeResponseDto>(
      url,
      payload,
      token,
    );

    const lockCodeData = plainToInstance(LockCodeResponseDto, responseData);
    const errors = await validate(lockCodeData);

    if (errors.length) {
      this.logger.error('Invalid lock code response:', errors);
      throw new Error('Invalid lock code response format');
    }

    return {
      ...lockCode,
      code: lockCodeData.pin,
    };
  }
}
