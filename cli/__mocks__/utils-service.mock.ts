import { UtilsService } from 'src/utils/utils.service';
import type { Mock } from 'vitest';

export type UtilsServiceMock = Record<keyof UtilsService, Mock>;

export function createUtilsServiceMock(): UtilsServiceMock {
  return {
    replaceHasuraSessionVars: vi.fn(),
    createConfigFile: vi.fn(),
    writeFile: vi.fn(),
    flatPermissionsMapping: vi.fn(),
  };
}
