import { Module } from '@nestjs/common';
import { CaslModule } from './casl/casl.module';
import { CosmiconfigModule } from './cosmiconfig/cosmiconfig.module';
import { UtilsModule } from './utils/utils.module';
import { LoggerModule } from './logger/logger.module';
import { HasuraModule } from './hasura/hasura.module';

@Module({
  imports: [
    CosmiconfigModule,
    CaslModule,
    UtilsModule,
    LoggerModule,
    HasuraModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
