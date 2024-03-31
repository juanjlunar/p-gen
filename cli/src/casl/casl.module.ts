import { Module } from '@nestjs/common';
import { CaslGeneratorCommand } from './casl-generator-command';
import { CaslService } from './casl.service';
import { CosmiconfigModule } from '../cosmiconfig/cosmiconfig.module';
import { HasuraModule } from '../hasura/hasura.module';
import { ICaslRepository } from './casl-repository/icasl-repository.interface';
import { CaslRepository } from './casl-repository/casl.repository';
import { CaslPermissionTransformer } from './casl-permission-transformer/casl-permission-transformer';

@Module({
  imports: [CosmiconfigModule, HasuraModule],
  providers: [
    {
      provide: ICaslRepository,
      useClass: CaslRepository,
    },
    CaslPermissionTransformer,
    CaslGeneratorCommand,
    CaslService,
  ],
  exports: [CaslPermissionTransformer, CaslService],
})
export class CaslModule {}
