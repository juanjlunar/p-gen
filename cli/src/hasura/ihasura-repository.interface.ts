import {
  CreateInsertPermissionArgs,
  CreateSelectPermissionArgs,
  CreateUpdatePermissionArgs,
  DropSelectPermissionArgs,
  FetchHasuraMetadataResult,
  GetHasuraMetadataArgs,
  HasuraMetadataSuccess,
} from './types';

export abstract class IHasuraRepository {
  abstract getHasuraMetadata(
    args: GetHasuraMetadataArgs,
  ): Promise<FetchHasuraMetadataResult>;

  abstract createSelectPermission(
    args: CreateSelectPermissionArgs,
  ): Promise<HasuraMetadataSuccess>;

  abstract createInsertPermission(
    args: CreateInsertPermissionArgs,
  ): Promise<HasuraMetadataSuccess>;

  abstract createUpdatePermission(
    args: CreateUpdatePermissionArgs,
  ): Promise<HasuraMetadataSuccess>;

  abstract createDeletePermission(
    args: CreateUpdatePermissionArgs,
  ): Promise<HasuraMetadataSuccess>;

  abstract dropPermission(
    args: DropSelectPermissionArgs,
  ): Promise<HasuraMetadataSuccess>;
}
