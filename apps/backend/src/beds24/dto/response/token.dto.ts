import { IsString, IsNotEmpty } from 'class-validator';

export class TokenResponseDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
