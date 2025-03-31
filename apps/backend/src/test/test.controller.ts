import { Controller, Get } from '@nestjs/common';
import { DirectusService } from 'src/directus/directus.service';
import { LockCodeService } from 'src/lock-code/lock-code.service';
import { SmsService } from 'src/sms/sms.service';

@Controller('test')
export class TestController {
  constructor(
    private readonly lockCodeService: LockCodeService,
    private readonly smsService: SmsService,
    private readonly directusService: DirectusService,
  ) {}

  @Get('directus')
  async directus() {
    return await this.directusService.getPropertyById('178821', 'fr-FR');
  }

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
