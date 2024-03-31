import { DropSelectPermissionArgs } from '../../src/hasura/types';
import { IHasuraRepository } from '../../src/hasura/ihasura-repository.interface';

export async function dropPermissionsSilent(
  hasuraRepository: IHasuraRepository,
  args: DropSelectPermissionArgs,
) {
  try {
    await hasuraRepository.dropPermission(args);
  } catch (error) {
    console.error(error);
  }
}
