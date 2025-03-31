import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { LockCodeModule } from 'src/lock-code/lock-code.module';
import { SmsModule } from 'src/sms/sms.module';
import { DirectusModule } from 'src/directus/directus.module';

@Module({
  imports: [LockCodeModule, SmsModule, DirectusModule],
  controllers: [TestController],
  providers: [],
})
export class TestModule {}
