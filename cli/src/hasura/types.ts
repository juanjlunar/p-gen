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
  check: Record<string, unknown>;
};

export type CreateSelectPermissionArgs<Role extends string = 'user'> = {
  source?: string;
  table: string;
  role: Role;
  permission: {
    columns: string[] | '*';
    filter: Record<string, unknown>;
  };
  headers: {
    hasuraAdminSecret: string;
    hasuraEndpointUrl: string;
  };
};

export interface CreateInsertPermissionArgs<Role extends string = 'user'>
  extends Omit<CreateSelectPermissionArgs<Role>, 'permission'> {
  permission: {
    columns: string[] | '*';
    check: Record<string, unknown>;
  };
}

export type CreateUpdatePermissionArgs = CreateSelectPermissionArgs;

export type DropSelectPermissionArgs<Role extends string = 'user'> = {
  type:
    | 'pg_drop_select_permission'
    | 'pg_drop_insert_permission'
    | 'pg_drop_update_permission'
    | 'pg_drop_delete_permission';
  source?: string;
  table: string;
  role: Role;
  headers: {
    hasuraAdminSecret: string;
    hasuraEndpointUrl: string;
  };
};

export type HasuraMetadataSuccess = {
  message: 'success';
};
