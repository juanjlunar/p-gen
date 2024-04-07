import type { Mock } from 'vitest';
import { HasuraService } from '../src/hasura/hasura.service';

export type HasuraServiceMock = Record<keyof HasuraService, Mock>;

export function createHasuraServiceMock(): HasuraServiceMock {
  return {
    filterTablesMetadata: vi.fn(),
  };
}
