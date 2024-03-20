import type { Config } from '../common/types';

export type CaslGeneratorOptions = {
  dataSource?: string;
  hasuraEndpointUrl?: string;
};

export type GenerateCaslPermissionsDto = {
  args: {
    hasuraAdminSecret: string;
  };
  options: CaslGeneratorOptions;
  config: Config;
};

export type CaslPermission = {
  action: string;
  subject: string;
  fields: string[] | null;
  conditions: Record<string, string>;
};

export type PermissionsMappingByRole = Record<string, CaslPermission[]>;
