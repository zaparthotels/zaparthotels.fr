import type { TGuest } from './TGuest';
export type TBooking = {
    id: string;
    beds24id: string;
    guest: TGuest;
    dates: {
        checkIn: Date;
        checkOut: Date;
    };
    additionalProperties?: unknown;
    status: 'confirmed' | 'request' | 'new' | 'cancelled' | 'black' | 'inquiry';
    createdAt: Date;
    updatedAt: Date;
};
//# sourceMappingURL=TBooking.d.ts.map