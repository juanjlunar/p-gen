import { Module } from '@nestjs/common';
import { CaslGeneratorCommand } from './casl-generator-command';
import { CaslService } from './casl.service';
import { CosmiconfigModule } from '../cosmiconfig/cosmiconfig.module';
import { HasuraModule } from '../hasura/hasura.module';

@Module({
  imports: [CosmiconfigModule, HasuraModule],
  providers: [CaslGeneratorCommand, CaslService],
})
export class CaslModule {}
