import { IHasuraRepository } from 'src/hasura/ihasura-repository.interface';
import { Mock } from 'vitest';

export type HasuraRepositoryMock = Record<keyof IHasuraRepository, Mock>;

export function createHasuraRepositoryMock(): HasuraRepositoryMock {
  return {
    getHasuraMetadata: vi.fn(),
    createSelectPermission: vi.fn(),
    dropPermission: vi.fn(),
  };
}
