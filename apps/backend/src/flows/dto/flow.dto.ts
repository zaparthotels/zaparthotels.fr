import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IFlow, TFlowStatus } from '@zaparthotels/types';
import { Type } from 'class-transformer';

export class FlowDto implements IFlow {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TFlowStatus)
  @IsNotEmpty()
  status: TFlowStatus;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
