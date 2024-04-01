export type CaslGeneratorOptions = {
  hasuraAdminSecret: string;
  dataSource?: string;
  hasuraEndpointUrl?: string;
  flat?: boolean;
};

export type GenerateCaslPermissionsDto = {
  hasuraAdminSecret: string;
  hasuraEndpointUrl: string;
  dataSource: string;
};

export type CaslPermission = {
  action: string;
  subject: string;
  fields: string[] | null;
  conditions: Record<string, string>;
};

export interface DBPermission extends CaslPermission {
  id: string | number;
}

export type PermissionsMappingByRole = Record<string, CaslPermission[]>;

export interface DBSyncPermission
  extends Pick<CaslPermission, 'action' | 'subject'> {
  fields: string | null;
  conditions: string;
}
