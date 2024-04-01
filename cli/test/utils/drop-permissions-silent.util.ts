import { DropSelectPermissionArgs } from '../../src/hasura/types';
import { IHasuraRepository } from '../../src/hasura/ihasura-repository.interface';

export async function dropPermissionsSilent(
  hasuraRepository: IHasuraRepository,
  args: DropSelectPermissionArgs,
  options = {} as Options,
) {
  const { silent = true } = options;

  try {
    await hasuraRepository.dropPermission(args);
  } catch (error) {
    if (!silent) {
      console.error(error);
    }
  }
}

type Options = {
  silent?: boolean;
};
