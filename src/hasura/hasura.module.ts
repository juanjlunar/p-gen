import { Module } from "../core/decorators/module.decorator";
import { HasuraController } from "./hasura.controller";
import { HasuraRepository } from "./hasura.repository";
import { HasuraService } from "./hasura.service";

@Module({
  providers: [
    HasuraController,
    HasuraService,
    HasuraRepository,
  ]
})
export class HasuraModule {}