import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Beds24Service } from './beds24.service';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, CacheModule.register(), HttpModule],
  providers: [Beds24Service],
  exports: [Beds24Service],
})
export class Beds24Module {}
