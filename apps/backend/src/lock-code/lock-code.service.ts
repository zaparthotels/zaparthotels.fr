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

@Injectable()
export class LockCodeService {
  private readonly logger = new Logger(LockCodeService.name);
  private readonly IGLOOHOME_BASE_URL =
    'https://api.igloodeveloper.co/igloohome';
  private readonly TOKEN_CACHE_KEY = 'IGLOOHOME_TOKEN';

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  private async fetchAndCacheToken(): Promise<string> {
    const url = 'https://auth.igloohome.co/oauth2/token';

    const headers = {
      Authorization: `Basic ${this.configService.getOrThrow<string>(
        'IGLOOHOME_CREDENTIALS',
      )}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const response = await firstValueFrom(
      this.httpService
        .post<TokenResponseDto>(url, null, {
          headers,
          params: { grant_type: 'client_credentials' },
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

    const { access_token, expires_in } = tokenData;
    await this.cacheManager.set(this.TOKEN_CACHE_KEY, access_token, expires_in);
    return access_token;
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
    const url = `${this.IGLOOHOME_BASE_URL}/devices/${lockCode.lockId}/algopin/hourly`;

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
