export const hasuraPermissionTypes = [
  'insert_permissions',
  'select_permissions',
  'update_permissions',
  'delete_permissions',
] as const;

export type HasuraPermissionType = (typeof hasuraPermissionTypes)[number];
