import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { firstValueFrom, retry, catchError } from 'rxjs';
import { TokenResponseDto } from './dto/response/token.dto';
import { Cache } from 'cache-manager';
import { Cron } from '@nestjs/schedule';
import {
  GetPropertyDto,
  GetPropertyPayloadDto,
} from './dto/response/get-property.dto';

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

  private async getValidToken(forceRefresh = false): Promise<string> {
    if (forceRefresh) {
      return this.fetchAndCacheToken();
    }

    const cachedToken = await this.cacheManager.get<string>(
      this.TOKEN_CACHE_KEY,
    );
    return cachedToken || this.fetchAndCacheToken();
  }

  @Cron('0 3 1,15 * *')
  private async ensureTokenRenewal(): Promise<void> {
    await this.getValidToken();
  }

  private async postWithAuth<T>(
    url: string,
    token: string,
    data: unknown,
  ): Promise<T> {
    const headers = {
      token,
      'Content-Type': 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<T>(url, data, { headers }).pipe(retry(3)),
      );
      return response.data;
    } catch (error) {
      this.logger.error('HTTP request failed', error);
      throw error;
    }
  }

  private async getWithAuth<T>(
    url: string,
    token: string,
    params?: Record<string, unknown>,
  ): Promise<T> {
    const headers = {
      token,
      'Content-Type': 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get<T>(url, { headers, params }).pipe(retry(3)),
      );
      return response.data;
    } catch (error) {
      this.logger.error('HTTP GET request failed', error);
      throw error;
    }
  }

  async sendMessage(beds24id: string, message: string): Promise<void> {
    const url = `${this.BEDS24_BASE_URL}/bookings/messages`;

    const payload = [
      {
        bookingId: beds24id,
        message,
      },
    ];

    const token = await this.getValidToken();

    try {
      await this.postWithAuth<void>(url, token, payload);
    } catch (error) {
      this.logger.error('Failed to send message', error);
      throw new Error('Failed to send message');
    }
  }

  async getProperty(beds24id: string): Promise<GetPropertyDto> {
    const url = `${this.BEDS24_BASE_URL}/properties`;

    const token = await this.getValidToken();

    try {
      const response = await this.getWithAuth<GetPropertyPayloadDto>(
        url,
        token,
        {
          id: beds24id,
        },
      );

      return response.data[0];
    } catch (error) {
      this.logger.error('Failed to get property', error);
      throw new Error('Failed to get property');
    }
  }
}
