import { igloohomeHandlers } from './igloohome.handlers';
import { beds24Handlers } from './beds24.handlers';
import { smsmcb29Handlers } from './smsmcb29';

export const handlers = [
  ...igloohomeHandlers,
  ...beds24Handlers,
  ...smsmcb29Handlers,
];
