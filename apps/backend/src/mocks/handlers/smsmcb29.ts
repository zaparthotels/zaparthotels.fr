import { http, HttpResponse } from 'msw';

export const smsmcb29Handlers = [
  http.post(
    'https://sms.fr7701.mcb29.net/api/3rdparty/v1/message',
    async ({ request }) => {
      const payload = await request.json();
      console.log('Received message payload:', payload);

      return HttpResponse.json({
        success: true,
      });
    },
  ),
];
