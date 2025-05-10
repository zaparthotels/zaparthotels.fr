import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPropertyDto {
  @IsString()
  @IsNotEmpty()
  checkInStart: string;

  @IsString()
  @IsNotEmpty()
  checkOutEnd: string;
}

export class GetPropertyPayloadDto {
  @ValidateNested({ each: true })
  @Type(() => GetPropertyDto)
  @IsNotEmpty()
  data: GetPropertyDto[];
}
