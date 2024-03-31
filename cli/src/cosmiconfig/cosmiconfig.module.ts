import { Global, Module } from '@nestjs/common';
import { CosmiconfigService } from './cosmiconfig.service';
import { CaslGeneratorCommand } from '../casl/casl-generator-command';
import { CONFIG_OPTIONS_TOKEN } from './constants/injection-tokens.constant';

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
  ],
  exports: [CosmiconfigService, CONFIG_OPTIONS_TOKEN],
})
export class CosmiconfigModule {}
