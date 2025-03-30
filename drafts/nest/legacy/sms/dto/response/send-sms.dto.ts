import { IsString } from 'class-validator';

export class SendSmsDto {
  @IsString()
  id: string;
}
