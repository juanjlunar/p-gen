import type { Knex } from 'knex';

export type Config = {
  transformers?: {
    action: (value: string) => string;
    subject: (value: string) => string;
  };
  replacements?: Record<string, string>;
  exports?: ConfigExports;
};

export type ConfigExports = JSONConfig;

export type JSONConfig = {
  type: 'JSON';
  options?: undefined;
};

export type DBConfig = {
  type: 'DB';
  options: {
    table: TableOptions;
  } & DBConnectionOptions;
};

export type DBConnectionOptions = {
  client: Knex.Config['client'];
  connection: Knex.Config['connection'];
};

export type TableOptions = {
  name: string;
};

export type ExportType = 'JSON' | 'DB';

export type AnyObject = Record<string, any>;
