import { Transform } from 'class-transformer';

export const EmptyToUndefined = () => {
  return Transform(({ value }) => (value === '' ? undefined : value));
};
