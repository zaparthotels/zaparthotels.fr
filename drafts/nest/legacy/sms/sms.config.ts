import Client from 'android-sms-gateway';

const LOGIN = 'BF5WEK';
const PASSWORD = 'if3dKLa2j3s8bbZdx76ER8pmZ9jAVa';
const BASE_URL = 'https://sms.fr7701.mcb29.net/api/3rdparty/v1';

export const smsClient = new Client(
  LOGIN,
  PASSWORD,
  {
    get: async (url, headers) => {
      const response = await fetch(url, { method: 'GET', headers });
      return response.json();
    },
    post: async (url, body, headers) => {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      return response.json();
    },
    delete: async (url, headers) => {
      const response = await fetch(url, { method: 'DELETE', headers });
      return response.json();
    },
  },
  BASE_URL,
);

export const smsQueue = {
  connection: {
    host: process.env.REDIS_HOSTNAME ?? 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT ?? '3004', 10),
  },
};
