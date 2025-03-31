import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsModule } from './bookings/bookings.module';
import { BullModule } from '@nestjs/bullmq';
import { TestModule } from './test/test.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { FlowsModule } from './flows/flows.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../../.env.local', '../../.env.dev'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('MONGO_USERNAME', 'backend')}:${configService.get('MONGO_PASSWORD', 'RwXHd8Dv9VmhDHBA6mYVqd3HuryQ3P')}@${configService.get('MONGO_HOSTNAME', '127.0.0.1')}:${configService.get('MONGO_PORT', '3003')}/${configService.get('MONGO_DATABASE', 'backend')}?authSource=admin`,
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOSTNAME', '127.0.0.1'),
          port: configService.get<number>('REDIS_PORT', 3004),
        },
      }),
    }),
    BookingsModule,
    WebhooksModule,
    FlowsModule,
    TestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
