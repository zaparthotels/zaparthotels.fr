export interface ILockCode {
  lockId: string;
  code?: string;
  createdAt?: Date;
  expiresAt: Date;
}