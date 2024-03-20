import { Module } from '@nestjs/common';
import { CosmiconfigService } from './cosmiconfig.service';

@Module({
  providers: [CosmiconfigService],
  exports: [CosmiconfigService],
})
export class CosmiconfigModule {}
