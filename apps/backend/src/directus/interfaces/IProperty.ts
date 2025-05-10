export interface IProperty {
  id: string;
  beds24id: string;
  lockId: string;
  arrivalNotificationTime: string;
  fallbackLockCode?: string;
  translations: {
    subject: string;
    notification: string;
  }[];
}
