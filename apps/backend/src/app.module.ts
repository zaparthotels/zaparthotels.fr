import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsModule } from './bookings/bookings.module';
import { BullModule } from '@nestjs/bullmq';
import { WebhooksModule } from './webhooks/webhooks.module';
import { FlowsModule } from './flows/flows.module';
import configuration from 'config/configuration';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['./.env.local', './.env.development'],
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.getOrThrow('MONGO_USERNAME')}:${configService.getOrThrow('MONGO_PASSWORD')}@${configService.getOrThrow('MONGO_HOSTNAME')}:${configService.getOrThrow('MONGO_PORT')}/${configService.getOrThrow('MONGO_DATABASE')}?authSource=admin`,
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.getOrThrow('REDIS_HOSTNAME'),
          port: configService.getOrThrow<number>('REDIS_PORT'),
        },
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      }),
    }),
    ScheduleModule.forRoot(),
    BookingsModule,
    WebhooksModule,
    FlowsModule,
  ],
})
export class AppModule {}
