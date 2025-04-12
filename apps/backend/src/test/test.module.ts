import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { LockCodeModule } from 'src/lock-code/lock-code.module';
import { SmsModule } from 'src/sms/sms.module';
import { DirectusModule } from 'src/directus/directus.module';
import { ArrivalModule } from 'src/flows/arrival/arrival.module';

@Module({
  imports: [LockCodeModule, SmsModule, DirectusModule, ArrivalModule],
  controllers: [TestController],
  providers: [],
})
export class TestModule {}
