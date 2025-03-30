import {
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { IUser, TRole } from '@zaparthotels/types';

export class UserDto implements IUser {
  @IsOptional()
  id?: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(TRole)
  roles: TRole[];
}
