export interface IBooking {
  _id?: unknown;
  beds24id: string;
  propertyId: string;
  guest: {
    _id?: unknown;
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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  additionalProperties?: Record<string, any>;
  status: TBookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TBookingStatus {
  CONFIRMED = 'confirmed',
  REQUEST = 'request',
  NEW = 'new',
  CANCELLED = 'cancelled',
  BLACK = 'black',
  INQUIRIRY = 'inquiry',
}
