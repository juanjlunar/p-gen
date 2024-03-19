import { CommandRunner, RootCommand, Option } from 'nest-commander';
import { CosmiconfigService } from '../cosmiconfig/cosmiconfig.service';
import { join } from 'path';
import type { CaslGeneratorOptions } from './types';
import { CaslService } from './casl.service';
import { DEFAULT_HASURA_ENDPOINT_URL } from '../hasura/constants';
import { Logger } from '@nestjs/common';

@RootCommand({
  description: 'Generate Casl permissions from Hasura permissions',
  arguments: '<hasura-admin-secret> [hasura-endpoint-url]',
  options: {
    isDefault: true,
  },
  argsDescription: {
    'hasura-admin-secret': 'The Hasura admin secret',
    'hasura-endpoint-url': `The Hasura endpoint url (default: "${DEFAULT_HASURA_ENDPOINT_URL}")`,
  },
})
export class CaslGeneratorCommand extends CommandRunner {
  private logger = new Logger();

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
    const { configPath = '' } = options;

    const config = await this.cosmiconfigService.loadOrCreate(
      join(process.cwd(), configPath),
      {
        loggerContext: CaslGeneratorCommand.name,
      },
    );

    const [hasuraAdminSecret, hasuraEndpointUrl] = passedParams;

    await this.caslService.generateCaslPermissions({
      args: {
        hasuraAdminSecret,
        hasuraEndpointUrl,
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
    flags: '-cp, --config-path [path]',
    description: 'The Hasura config file path (default: "")',
  })
  parseConfigPath(value: string) {
    return value;
  }
}
