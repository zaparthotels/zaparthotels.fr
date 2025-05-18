import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

export const igloohomeHandlers = [
  http.post('https://auth.igloohome.co/oauth2/token', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const contentType = request.headers.get('Content-Type');

    if (
      !authHeader?.startsWith('Basic ') ||
      contentType !== 'application/x-www-form-urlencoded'
    ) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json({
      access_token: 'mocked-access-token-abc',
      expires_in: 3600,
    });
  }),

  http.post(
    'https://api.igloodeveloper.co/igloohome/devices/:lockId/algopin/hourly',
    async ({ request }) => {
      const token = request.headers.get('Authorization');
      const body = await request.json();

      if (!token?.startsWith('Bearer mocked-access-token-abc')) {
        return HttpResponse.json({ error: 'Invalid token' }, { status: 403 });
      }

      console.log('Received payload:', body);

      return HttpResponse.json({
        pin: faker.string.numeric({ length: 6 }),
        pinId: 'abc123',
      });
    },
  ),
];
