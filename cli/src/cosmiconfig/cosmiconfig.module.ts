import { Global, Module } from '@nestjs/common';
import { CosmiconfigService } from './cosmiconfig.service';
import { CaslGeneratorCommand } from '../casl/casl-generator-command';
import { CONFIG_OPTIONS_TOKEN } from './constants/injection-tokens.constant';
import { ConfigService } from './config/config.service';

@Global()
@Module({
  providers: [
    CosmiconfigService,
    {
      provide: CONFIG_OPTIONS_TOKEN,
      inject: [CosmiconfigService],
      useFactory: async (cosmiconfigService: CosmiconfigService) => {
        const config = await cosmiconfigService.loadOrCreate({
          loggerContext: CaslGeneratorCommand.name,
        });

        return config;
      },
    },
    ConfigService,
  ],
  exports: [CosmiconfigService, CONFIG_OPTIONS_TOKEN, ConfigService],
})
export class CosmiconfigModule {}
