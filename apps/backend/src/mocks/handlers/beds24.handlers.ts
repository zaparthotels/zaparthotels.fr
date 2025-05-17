import { http, HttpResponse } from 'msw';

export const beds24Handlers = [
  http.get('https://beds24.com/api/v2/properties', () => {
    return HttpResponse.json({
      data: [
        {
          checkInStart: '9:00',
          checkOutEnd: '17:00',
        },
      ],
    });
  }),

  http.get('https://beds24.com/api/v2/authentication/token', () => {
    return HttpResponse.json({
      token: 'mocked-token-123',
    });
  }),

  http.post(
    'https://beds24.com/api/v2/bookings/messages',
    async ({ request }) => {
      const payload = await request.json();
      console.log('Received message payload:', payload);

      return HttpResponse.json({
        success: true,
      });
    },
  ),
];
