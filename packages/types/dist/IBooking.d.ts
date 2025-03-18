export interface IBooking {
    beds24id: string;
    guest: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        locale?: string;
    };
    dates: {
        checkIn: Date;
        checkOut: Date;
    };
    additionalProperties?: Record<string, any>;
    status: TBookingStatus;
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