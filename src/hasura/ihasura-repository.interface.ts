import { FetchHasuraMetadataResult, GetHasuraMetadataArgs } from './types';

export abstract class IHasuraRepository {
  abstract getHasuraMetadata(
    args: GetHasuraMetadataArgs,
  ): Promise<FetchHasuraMetadataResult>;
}
