export interface IProperty {
  id: string;
  beds24id: string;
  arrivalNotificationTime: string;
  departureNotificationTime: string;
  translations: {
    subject: string;
    notificationArrival: string;
    notificationDeparture: string;
  }[];
  locks: {
    lockId: string;
    fallbackLockCode: string;
  }[];
}
