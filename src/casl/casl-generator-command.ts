import { CommandRunner, RootCommand, Option } from 'nest-commander';
import { CosmiconfigService } from '../cosmiconfig/cosmiconfig.service';
import type { CaslGeneratorOptions } from './types';
import { CaslService } from './casl.service';
import { DEFAULT_HASURA_ENDPOINT_URL } from '../hasura/constants';

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
    private readonly cosmiconfigService: CosmiconfigService,
    private readonly caslService: CaslService,
  ) {
    super();
  }

  async run(
    passedParams: string[],
    options?: CaslGeneratorOptions,
  ): Promise<void> {
    const config = await this.cosmiconfigService.loadOrCreate({
      loggerContext: CaslGeneratorCommand.name,
    });

    const [hasuraAdminSecret] = passedParams;

    await this.caslService.generateCaslPermissions({
      args: {
        hasuraAdminSecret,
      },
      options,
      config,
    });
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
}
