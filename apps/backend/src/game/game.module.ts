import { Module } from '@nestjs/common';
import { WaitingService } from 'src/websocket/waiting.service';
import { RedisModule } from '../redis/redis.module';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  imports: [RedisModule],
  controllers: [GameController],
  providers: [GameService, WaitingService],
  exports: [GameService],
})
export class GameModule {}
