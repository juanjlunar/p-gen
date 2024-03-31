import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from './knex.module-definition';
import { KNEX_INJECTION_TOKEN } from './constants/injection-tokens.constant';
import { KnexModuleOptions } from './interfaces/knex-module-options.interface';
// import { CosmiconfigService } from 'src/cosmiconfig/cosmiconfig.service';
import knex, { Knex } from 'knex';
import { InjectKnex } from './decorators/inject-knex.decorator';

@Global()
@Module({})
export class KnexModule extends ConfigurableModuleClass {
  constructor(@InjectKnex() private readonly knex: Knex) {
    super();
  }

  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.register(options);

    return KnexModule.resolveDynamicModule(dynamicModule);
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.registerAsync(options);

    return KnexModule.resolveDynamicModule(dynamicModule);
  }

  private static resolveDynamicModule(
    dynamicModule: DynamicModule,
  ): DynamicModule {
    const providers = dynamicModule.providers ?? [];

    return {
      ...dynamicModule,
      providers: [
        ...providers,
        {
          inject: [MODULE_OPTIONS_TOKEN],
          provide: KNEX_INJECTION_TOKEN,
          useFactory: (knexModuleOptions: KnexModuleOptions) => {
            return knex(knexModuleOptions);
          },
        },
      ],
      exports: [KNEX_INJECTION_TOKEN],
    };
  }

  async onApplicationShutdown(): Promise<any> {
    try {
      await this.knex.destroy();
    } catch (error) {
      // Do nothing the knex instance has not been set.
    }
  }
}
