export type GetHasuraMetadataArgs = {
  hasuraAdminSecret: string;
  hasuraEndpointUrl: string;
};

export type FetchHasuraMetadataResult = {
  resource_version: number;
  metadata: HasuraMetadata;
};

export type HasuraMetadata = {
  version: number;
  sources: HasuraMetadataSource[];
};

export type HasuraMetadataSource = {
  name: string;
  kind: 'postgres';
  tables: HasuraMetadataTable[];
};

export type HasuraMetadataTable = {
  table: {
    name: string;
    schema: string;
  };
  insert_permissions?: HasuraRolePermission[];
  select_permissions?: HasuraRolePermission[];
  update_permissions?: HasuraRolePermission[];
  delete_permissions?: HasuraRolePermission[];
};

export type HasuraRolePermission = {
  role: string;
  permission: HasuraPermission;
};

export type HasuraPermission = {
  columns: string[];
  filter: Record<string, unknown>;
  comment: string;
};
