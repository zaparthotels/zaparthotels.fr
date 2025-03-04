import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LockCodeDto } from './lock-code.dto';

export class AdditionalPropertiesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LockCodeDto)
  lockCodes: LockCodeDto[];
}
