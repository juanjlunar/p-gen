import { CaslPermissionTransformer } from '../src/casl/casl-permission-transformer/casl-permission-transformer';
import { Mock } from 'vitest';

export type CaslPermissionTransformerMock = Record<
  keyof CaslPermissionTransformer,
  Mock
>;

export function createCaslPermissionTransformerMock(): CaslPermissionTransformerMock {
  return {
    caslify: vi.fn(),
  };
}
