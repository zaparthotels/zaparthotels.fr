import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Beds24Service } from './beds24/beds24.service';
import { CacheConfigModule } from './cache/cache.module';
import { SmsModule } from './sms/sms.module';
import { BookingsService } from './bookings/bookings.service';
import { BookingsController } from './bookings/bookings.controller';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    CacheConfigModule,
    ConfigModule.forRoot({
      envFilePath: ['../../.env.local', '../../.env.dev'],
    }),
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_USERNAME || 'backend'}:${process.env.MONGO_PASSWORD || 'RwXHd8Dv9VmhDHBA6mYVqd3HuryQ3P'}@${process.env.MONGO_HOSTNAME || 'localhost'}:${process.env.MONGO_PORT || '3003'}/${process.env.MONGO_DATABASE || 'backend'}?authSource=admin`,
    ),
    SmsModule,
    BookingsModule,
  ],
  controllers: [AppController, BookingsController],
  providers: [AppService, Beds24Service, BookingsService],
})
export class AppModule {}
