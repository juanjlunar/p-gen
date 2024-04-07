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
  options: {
    isDefault: true,
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
    _passedParams: string[],
    options = {} as CaslGeneratorOptions,
  ): Promise<void> {
    const {
      hasuraAdminSecret,
      hasuraEndpointUrl = DEFAULT_HASURA_ENDPOINT_URL,
      dataSource = DEFAULT_DATA_SOURCE,
      flat = false,
    } = options;

    const permissions = await this.caslService.generateCaslPermissions({
      hasuraAdminSecret,
      hasuraEndpointUrl,
      dataSource,
    });

    const resolvedPermissions = !flat
      ? permissions
      : this.utilsService.flatPermissionsMapping(permissions);

    await this.caslService.exportToJSON(resolvedPermissions);
  }

  @Option({
    flags: '-s, --hasura-admin-secret <hasura-admin-secret>',
    description:
      'Indicates your Hasura server admin secret to connect to. (Required)',
    required: true,
  })
  parseHasuraSecret(value: string) {
    return value;
  }

  @Option({
    flags: '-ds, --data-source [data-source]',
    description:
      'Indicates the Hasura data source to fetch the permissions from (default: "default")',
  })
  parseDataSource(value: string) {
    return value;
  }

  @Option({
    flags: '-he, --hasura-endpoint-url <hasura-endpoint-url>',
    description: `Indicates the Hasura server's location. It is required to provide the full url including the /v1/metadata (default: "${DEFAULT_HASURA_ENDPOINT_URL}")`,
  })
  parseHasuraEndpointUrl(value: string) {
    return value;
  }

  @Option({
    flags: '-f, --flat [flat]',
    description: `Generates permissions without the Hasura roles mapping. It will be a plain array with the permissions without the role separation. (default: false)`,
  })
  parseFlat(value: string) {
    return value.toLowerCase() === 'true';
  }
}
