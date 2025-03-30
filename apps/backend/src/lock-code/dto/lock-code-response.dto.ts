import { IsString, IsNotEmpty } from 'class-validator';

export class LockCodeResponseDto {
  @IsString()
  @IsNotEmpty()
  pin: string;

  @IsString()
  @IsNotEmpty()
  pinId: string;
}
