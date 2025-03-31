import { ILockCode } from '@zaparthotels/types';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LockCodeDto implements ILockCode {
  @IsString()
  @IsNotEmpty()
  lockId: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  codeId?: string;

  @IsDate()
  @Type(() => Date)
  startsAt: Date;

  @IsDate()
  @Type(() => Date)
  expiresAt: Date;
}
