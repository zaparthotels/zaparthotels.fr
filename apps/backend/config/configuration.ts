import { readFileSync } from 'node:fs';
import * as yaml from 'js-yaml';
import { join } from 'node:path';
import { ENodeEnv } from '@zaparthotels/types';

const isValidNodeEnv = (value: string): value is ENodeEnv => {
  return Object.values(ENodeEnv).includes(value as ENodeEnv);
};

export const setupEnv = (): void => {
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv && isValidNodeEnv(nodeEnv)) return;

  process.env.NODE_ENV = ENodeEnv.DEVELOPMENT;

  console.warn(
    `Invalid or missing NODE_ENV value: ${nodeEnv}. Defaulting to 'development'.`,
  );
};

const getConfigFile = (): string => {
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  return `config.${process.env.NODE_ENV}.yaml`;
};

export default () => {
  try {
    setupEnv();

    const configFilePath = join(__dirname, getConfigFile());
    return yaml.load(readFileSync(configFilePath, 'utf8')) as Record<
      string,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      any
    >;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to load configuration');
  }
};
