import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class TokenResponseDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @IsNumber()
  @IsNotEmpty()
  expires_in: number;
}
