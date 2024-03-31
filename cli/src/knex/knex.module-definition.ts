import { ConfigurableModuleBuilder } from '@nestjs/common';
import { KnexModuleOptions } from './interfaces/knex-module-options.interface';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<KnexModuleOptions>().build();
