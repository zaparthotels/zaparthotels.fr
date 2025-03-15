import type { ITranslation } from './ITranslation';
export interface ICard extends ITranslation {
    type: 'users' | 'situations';
    id: number;
}
export interface IGroup extends ITranslation {
    id: number;
}
export interface IDeck extends ITranslation {
    id: number;
}
//# sourceMappingURL=IDirectus.d.ts.map