import { CaslService } from 'src/casl/casl.service';
import { Mock } from 'vitest';

export type CaslServiceMock = Record<keyof CaslService, Mock>;

export function createCaslServiceMock(): CaslServiceMock {
  return {
    generateCaslPermissions: vi.fn(),
    exportToJSON: vi.fn(),
  };
}
