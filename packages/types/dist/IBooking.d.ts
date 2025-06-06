import type { IDates } from './IDates';
import type { IGuest } from './IGuest';
import type { ILockCode } from './ILockCode';
export interface IBooking {
    _id?: unknown;
    beds24id: string;
    propertyId: string;
    guest: IGuest;
    dates: IDates;
    status: TBookingStatus;
    lockCodes?: ILockCode[];
    createdAt: Date;
    updatedAt: Date;
}
export declare enum TBookingStatus {
    CONFIRMED = "confirmed",
    REQUEST = "request",
    NEW = "new",
    CANCELLED = "cancelled",
    BLACK = "black",
    INQUIRIRY = "inquiry"
}
//# sourceMappingURL=IBooking.d.ts.map