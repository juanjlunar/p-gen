import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HasuraRepository } from './hasura.repository';
import { IHasuraRepository } from './ihasura-repository.interface';
import { HasuraService } from './hasura.service';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: IHasuraRepository,
      useClass: HasuraRepository,
    },
    HasuraService,
  ],
  exports: [IHasuraRepository, HasuraService],
})
export class HasuraModule {}
