import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Beds24Service } from './beds24/beds24.service';
import { Beds24Controller } from './beds24/beds24.controller';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_USERNAME || 'backend'}:${process.env.MONGO_PASSWORD || 'RwXHd8Dv9VmhDHBA6mYVqd3HuryQ3P'}@${process.env.MONGO_HOSTNAME || 'localhost'}:${process.env.MONGO_PORT || '3003'}/${process.env.MONGO_DATABASE || 'backend'}?authSource=admin`,
    ),
  ],
  controllers: [AppController, Beds24Controller],
  providers: [AppService, Beds24Service],
})
export class AppModule {}
