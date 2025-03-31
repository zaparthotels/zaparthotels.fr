import { IDates } from '@zaparthotels/types';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class DatesDto implements IDates {
  @IsDate()
  @Type(() => Date)
  checkIn: Date;

  @IsDate()
  @Type(() => Date)
  checkOut: Date;
}
