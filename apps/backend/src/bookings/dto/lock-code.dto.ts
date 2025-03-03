import { IsString, IsInt, IsOptional } from 'class-validator';
import type { TLockCode } from '@zaparthotels/types';

export class LockCodeDto {
  @IsString()
  lockId: TLockCode['lockId'];

  @IsString()
  code: TLockCode['code'];

  @IsOptional()
  @IsInt()
  createdAt: TLockCode['createdAt'];

  @IsOptional()
  @IsInt()
  expiresAt: TLockCode['expiresAt'];
}
