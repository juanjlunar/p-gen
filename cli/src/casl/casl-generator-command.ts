import { CommandRunner, RootCommand, Option } from 'nest-commander';
import type { CaslGeneratorOptions } from './types';
import { CaslService } from './casl.service';
import {
  DEFAULT_DATA_SOURCE,
  DEFAULT_HASURA_ENDPOINT_URL,
} from '../hasura/constants';
import { UtilsService } from '../utils/utils.service';

@RootCommand({
  description: 'Generate Casl permissions from Hasura permissions',
  arguments: '<hasura-admin-secret>',
  options: {
    isDefault: true,
  },
  argsDescription: {
    'hasura-admin-secret': 'The Hasura admin secret',
  },
})
export class CaslGeneratorCommand extends CommandRunner {
  constructor(
    private readonly caslService: CaslService,
    private readonly utilsService: UtilsService,
  ) {
    super();
  }

  async run(
    passedParams: string[],
    options = {} as CaslGeneratorOptions,
  ): Promise<void> {
    const {
      hasuraEndpointUrl = DEFAULT_HASURA_ENDPOINT_URL,
      dataSource = DEFAULT_DATA_SOURCE,
      unflatten = false,
    } = options;

    const [hasuraAdminSecret] = passedParams;

    const permissions = await this.caslService.generateCaslPermissions({
      hasuraAdminSecret,
      hasuraEndpointUrl,
      dataSource,
    });

    const resolvedPermissions = !unflatten
      ? permissions
      : this.utilsService.unflattenPermissionsMapping(permissions);

    await this.caslService.exportToJSON(resolvedPermissions);
  }

  @Option({
    flags: '-ds, --data-source [data-source]',
    description: 'The Hasura data source name (default: "default")',
  })
  parseDataSource(value: string) {
    return value;
  }

  @Option({
    flags: '-he, --hasura-endpoint-url <hasura-endpoint-url>',
    description: `The Hasura endpoint url (default: "${DEFAULT_HASURA_ENDPOINT_URL}")`,
  })
  parseHasuraEndpointUrl(value: string) {
    return value;
  }

  @Option({
    flags: '-u, --unflatten [unflatten]',
    description: `Indicate if the permissions should be unflattened. A CaslPermission array will be created instead of a Hasura role to CaslPermission array mapping.`,
  })
  parseUnflatten(value: string) {
    return value.toLowerCase() === 'true';
  }
}
