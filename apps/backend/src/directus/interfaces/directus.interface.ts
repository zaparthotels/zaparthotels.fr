export interface ITranslation {
  languageCode: string;
}

export interface ICard extends ITranslation {
  type: 'users' | 'situations';
  requestLanguage: string;
  id: number;
}

export interface IGroup extends ITranslation {
  id: number;
}

export interface IDeck extends ITranslation {
  id: number;
}
