export interface IProperty {
  id: string;
  beds24id: string;
  lockId: string;
  arrivalNotificationTime: string;
  departureNotificationTime: string;
  fallbackLockCode?: string;
  translations: {
    subject: string;
    notification_arrival: string;
    notification_departure: string;
  }[];
}
