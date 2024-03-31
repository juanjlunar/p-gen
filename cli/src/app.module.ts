import { Module } from '@nestjs/common';
import { CaslModule } from './casl/casl.module';
import { CosmiconfigModule } from './cosmiconfig/cosmiconfig.module';
import { UtilsModule } from './utils/utils.module';
import { LoggerModule } from './logger/logger.module';
import { HasuraModule } from './hasura/hasura.module';
// import { KnexModule } from './knex/knex.module';
// import { CONFIG_OPTIONS_TOKEN } from './cosmiconfig/constants/injection-tokens.constant';
// import { Config } from './common/types';

@Module({
  imports: [
    CosmiconfigModule,
    CaslModule,
    UtilsModule,
    LoggerModule,
    HasuraModule,
    // KnexModule.registerAsync({
    //   inject: [CONFIG_OPTIONS_TOKEN],
    //   useFactory: async (configOptions: Config) => {
    //     // Return dummy connection if the export type is JSON.
    //     if (
    //       !configOptions?.exports?.type ||
    //       configOptions?.exports?.type === 'JSON'
    //     ) {
    //       return {
    //         client: 'pg',
    //         connection: {
    //           connectionString: '',
    //         },
    //       };
    //     }

    //     const dbOptions = configOptions?.exports?.options;

    //     /**
    //      * If the export type is DB and the options are missing we throw an exception to avoid initializing this module.
    //      *
    //      */
    //     if (configOptions?.exports?.type === 'DB' && !dbOptions) {
    //       throw new Error('Missing DB export options.');
    //     }

    //     return {
    //       client: dbOptions.client,
    //       connection: dbOptions.connection,
    //     };
    //   },
    // }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
