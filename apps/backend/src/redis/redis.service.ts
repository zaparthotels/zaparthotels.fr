import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';
import { IGame } from '../game/interfaces/game.interface';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  onModuleInit() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOSTNAME || 'localhost',
      port: Number.parseInt(process.env.REDIS_PORT, 10) || 3004,
    });
    console.log('Redis client initialized');
  }

  async set(key: string, value: string) {
    return this.redisClient.set(key, value);
  }

  async get(key: string) {
    return this.redisClient.get(key);
  }

  // ========== Game ==========

  async setGame(key: string, value: IGame) {
    return this.redisClient.set(key, JSON.stringify(value));
  }

  async getGame(key: string): Promise<IGame> {
    const gameData = await this.redisClient.get(key);
    return JSON.parse(gameData) as IGame;
  }

  async getAllGames(): Promise<IGame[]> {
    const keys = await this.redisClient.keys('*');

    // If no games are recorded
    if (keys.length === 0) {
      return [];
    }

    const gameDataArray = await this.redisClient.mget(keys); // Retrieve all values in a single command
    return gameDataArray
      .map((gameData) => {
        try {
          const parsedGame = JSON.parse(gameData);
          return parsedGame?.code && parsedGame.status ? parsedGame : null;
        } catch (error) {
          console.error('Error parsing game data:', error);
          return null;
        }
      })
      .filter((game) => game !== null);  // Remove null entries
  }

  async deleteOneGame(key: string): Promise<boolean> {
    const result = await this.redisClient.del(key);
    return result > 0;
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
    console.log('Redis client disconnected');
  }
}
