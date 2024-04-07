import { type HasuraPermissionType } from '../../hasura/constants/permissions.constant';

export type Config = {
  transformers?: {
    action: (value: string) => string;
    subject: (value: string) => string;
  };
  replacements?: Record<string, string>;
  include?: Record<string, HasuraPermissionType[]>;
  exports?: ConfigExports;
};

export type ConfigExports = JSONConfig;

export type JSONConfig = {
  type: 'JSON';
  options?: undefined;
};

export type TableOptions = {
  name: string;
};

export type ExportType = 'JSON' | 'DB';

export type AnyObject = Record<string, any>;
