export interface ILockCode {
  lockId: string;
  code?: string;
  codeId?: string;
  startsAt: Date;
  expiresAt: Date;
}