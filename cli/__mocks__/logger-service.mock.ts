import type { Mock } from 'vitest';
import { LoggerService } from '../src/logger/logger.service';

type PartialLoggerService = Pick<
  LoggerService,
  'log' | 'error' | 'warn' | 'debug' | 'fatal' | 'verbose'
>;

export type LoggerServiceMock = Record<keyof PartialLoggerService, Mock>;

export function createLoggerServiceMock(): LoggerServiceMock {
  return {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
    verbose: vi.fn(),
  };
}
