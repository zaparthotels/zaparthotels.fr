import type { TRole } from './TRole';

export interface IUser {
  id?: string;
  firstName: string;
  lastName: string;
  roles: TRole[];
}
