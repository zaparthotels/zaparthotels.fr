import { ICard, IDeck, IGroup, ITranslation } from '@tousinclus/types';
import { IsString, IsInt, IsNotEmpty } from 'class-validator';

// ========== DTO ==========
export class ITranslationDTO implements ITranslation {
  @IsString()
  @IsNotEmpty()
  requestLanguage: string;
}

export class ICardDTO extends ITranslationDTO implements ICard {
  @IsInt()
  id: number;

  @IsString()
  @IsNotEmpty()
  type: 'users' | 'situations';

  @IsString()
  @IsNotEmpty()
  requestLanguage: string;
}

export class IGroupDTO extends ITranslationDTO implements IGroup {
  @IsInt()
  id: number;
}

export class IDeckDTO extends ITranslationDTO implements IDeck {
  @IsInt()
  id: number;
}
