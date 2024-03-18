import { HasuraService } from "./hasura.service";
import { GenerateCaslPermissionsDto } from "./dto/generate-casl-permissions.dto";
import { Injectable } from "../core/decorators/injectable.decorator";
import type { Config } from "../types";

@Injectable()
export class HasuraController {
  constructor(
    private readonly hasuraService: HasuraService,
  ) {}

  async generateCaslPermissions(generateCaslPermissionsDto: GenerateCaslPermissionsDto, config: Config | null) {
    await this.hasuraService.generateCaslPermissions(generateCaslPermissionsDto, config);
  }
}