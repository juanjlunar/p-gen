import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HasuraRepository } from './hasura.repository';
import { IHasuraRepository } from './ihasura-repository.interface';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: IHasuraRepository,
      useClass: HasuraRepository,
    },
  ],
  exports: [IHasuraRepository],
})
export class HasuraModule {}
