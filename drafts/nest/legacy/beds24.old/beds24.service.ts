import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { validateOrReject } from 'class-validator';

@Injectable()
export class Beds24Service {
  private readonly logger = new Logger(Beds24Service.name);

  readonly BASE_URL = 'https://beds24.com/api/v2/';
  private readonly REFRESH_TOKEN = process.env.BEDS24_REFRESH_TOKEN;
  private readonly TOKEN_CACHE_KEY = 'beds24_token';
  private readonly TOKEN_TTL_SECONDS = 86400; // 24 hours

  constructor(private readonly cacheService: CacheService) {}

  async getToken(): Promise<string> {
    const cachedToken = await this.cacheService.getCache<string>(
      this.TOKEN_CACHE_KEY,
    );

    if (cachedToken) {
      return cachedToken;
    }

    this.logger.log('No cached token found. Fetching a new one.');
    const token = await this.refreshToken(this.REFRESH_TOKEN);

    await this.cacheService.setCache(
      this.TOKEN_CACHE_KEY,
      token,
      this.TOKEN_TTL_SECONDS,
    );
    this.logger.log('New token stored in cache.');

    return token;
  }

  private async refreshToken(refreshToken: string): Promise<string> {
    const url = new URL('authentication/token', this.BASE_URL);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          refreshToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.error(
          `Beds24 API error: ${response.status} ${response.statusText}`,
        );
        throw new InternalServerErrorException(
          `Beds24 API error: ${response.statusText}`,
        );
      }

      const data: RefreshTokenDto = await response.json();
      const dto = Object.assign(new RefreshTokenDto(), data);

      await validateOrReject(dto);
      return data.token;
    } catch (error: unknown) {
      this.logger.error('Error fetching token', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Error fetching token: ${message}`,
      );
    }
  }
}
