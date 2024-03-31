import {
  CreateSelectPermissionArgs,
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

  abstract dropPermission(
    args: DropSelectPermissionArgs,
  ): Promise<HasuraMetadataSuccess>;
}
