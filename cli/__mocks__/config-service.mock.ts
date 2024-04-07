import { Mock } from 'vitest';
import { ConfigService } from '../src/cosmiconfig/config/config.service';

export type ConfigServiceMock = Record<keyof ConfigService, Mock>;

export function createConfigServiceMock(): ConfigServiceMock {
  return {
    getConfig: vi.fn(),
  };
}
