export interface IProperty {
  id: string;
  beds24id: string;
  arrivalNotificationTime: string;
  departureNotificationTime: string;
  translations: {
    subject: string;
    notification_arrival: string;
    notification_departure: string;
  }[];
  locks: {
    lockId: string;
    fallbackLockCode: string;
  }[];
}
