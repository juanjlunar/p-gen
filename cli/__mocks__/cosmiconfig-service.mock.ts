import { CosmiconfigService } from '../src/cosmiconfig/cosmiconfig.service';
import { Mock } from 'vitest';

export type CosmiConfigServiceMock = Record<keyof CosmiconfigService, Mock>;

export function createCosmiConfigServiceMock(): CosmiConfigServiceMock {
  return {
    load: vi.fn(),
    loadOrCreate: vi.fn(),
    searchWithoutCache: vi.fn(),
  };
}
