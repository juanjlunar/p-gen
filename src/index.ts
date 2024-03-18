#! /usr/bin/env node

import 'reflect-metadata';
import { Command } from 'commander';
import figlet from 'figlet';
import { AppFactory } from './core/factories/app.factory';
import { AppModule } from './app.module';
import { HasuraController } from './hasura/hasura.controller';
import { join } from 'path';
import { Config } from './types';
import type { CLIOptions } from './types';
import { cosmiconfig } from 'cosmiconfig';
import { CONFIG_FILE_NAME } from './common/constants';

const explorer = cosmiconfig('pg');

const program = new Command();

console.log(figlet.textSync("Permissions Gen"));

const app = AppFactory.create(AppModule);

program
  .argument('<hasura-admin-secret>', 'The Hasura admin secret')
  .argument('[hasura-endpoint-url]', 'The Hasura endpoint url', 'http://localhost:8080/v1/metadata')
  .option('--source <source>', 'The Hasura data source name', 'default')
  .option('--config-path <path>', 'The Hasura config file path (without the file name, the file should be pg.config.js)', '')
  .description('Generate Casl permissions from Hasura permissions')
  .action(async (...args: any[]) => {
    
    if (program.args.length > 2) {
      return;
    }

    const options = program.opts<CLIOptions>();

    const configFile = await explorer.load(join(process.cwd(), options.configPath, CONFIG_FILE_NAME));

    const config = configFile?.config as Config | null;

    const [hasuraAdminSecret, hasuraEndpointUrl] = args as string[];

    const hasuraController = app.get(HasuraController);

    await hasuraController.generateCaslPermissions(
      {
        args: {
          hasuraAdminSecret,
          hasuraEndpointUrl,
        },
        options,
      }, 
      config
    );
  })
  .parse();

if (!process.argv.slice(2).length) {
  program.outputHelp();
}