import { ENodeEnv } from '@zaparthotels/types';

export const setup = async () => {
  if (process.env.NODE_ENV !== ENodeEnv.PRODUCTION) {
    const { mockServer } = await import('./mocks/mockServer');

    mockServer.listen({
      onUnhandledRequest: 'warn',
    });

    console.warn('[WARN] Mock server is running');
  }
};
