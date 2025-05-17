import { setupServer } from 'msw/node';
import { handlers } from './handlers/index';

export const mockServer = setupServer(...handlers);
