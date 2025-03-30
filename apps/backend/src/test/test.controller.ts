import { Controller, Get } from '@nestjs/common';
import { LockCodeService } from 'src/lock-code/lock-code.service';
import { SmsService } from 'src/sms/sms.service';

@Controller('test')
export class TestController {
  constructor(
    private readonly lockCodeService: LockCodeService,
    private readonly smsService: SmsService,
  ) {}

  @Get('sms')
  sms() {
    return this.smsService.sendSms({
      phoneNumber: '+33637056203',
      message: 'testttttt',
    });
  }

  @Get('lockCode')
  lockCode() {
    return this.lockCodeService.create({
      lockId: 'IGK3091f9efe',
      startsAt: new Date('2025-12-31'),
      expiresAt: new Date('2026-01-01'),
    });
  }
}
