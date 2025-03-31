import { Module } from '@nestjs/common';
import { DirectusService } from './directus.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [ConfigModule, CacheModule.register()],
  providers: [DirectusService],
  exports: [DirectusService],
})
export class DirectusModule {}
