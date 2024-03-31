import { ICaslRepository } from 'src/casl/casl-repository/icasl-repository.interface';
import type { Mock } from 'vitest';

export type CaslRepositoryMock = Record<keyof ICaslRepository, Mock>;

export function createCaslRepositoryMock(): CaslRepositoryMock {
  return {
    getDBPermissions: vi.fn(),
  };
}
