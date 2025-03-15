import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Stores data with a specific TTL
  async setCache<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  // Retrieves data from cache
  async getCache<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  // Deletes data from cache
  async deleteCache(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}
