import type { Config } from "../types";
import { Injectable } from "../core/decorators/injectable.decorator";
import { hasuraPermissionTypes } from "./constants/permissions.constant";
import type { GenerateCaslPermissionsDto } from "./dto/generate-casl-permissions.dto";
import { HasuraRepository } from "./hasura.repository";
import type { CaslPermission } from "./types";
import { UtilsService } from "../utils/utils.service";
import { writeFile } from "fs/promises";
import { join } from "path";
import { defaultMatcherReplacements } from "../common/config/default-matcher-replacements.config";

@Injectable()
export class HasuraService {
  constructor(
    private readonly hasuraRepository: HasuraRepository,
    private readonly utilsService: UtilsService,
  ) {}
  
  async generateCaslPermissions(generateCaslPermissionsDto: GenerateCaslPermissionsDto, config: Config | null) {
    const { args: { hasuraAdminSecret, hasuraEndpointUrl }, options } = generateCaslPermissionsDto;

    const { transformers: {
      action: actionTransformer = undefined,
      subject: subjectTransformer = undefined,
    } = {}, replacements = {} } = config ?? {};

    const hasuraMetadata = await this.hasuraRepository.getHasuraMetadata({
      hasuraAdminSecret,
      hasuraEndpointUrl,
    });

    const hasuraRoleToCaslPermissions = {} as Record<string, CaslPermission[]>;

    const sourceOption = options.source as string;

    const dataSource = hasuraMetadata.metadata.sources.find((value) => value.name === sourceOption);

    if (!dataSource) {
      throw new Error(`DataSource ${dataSource} not found.`)
    }

    dataSource.tables.forEach((tableMetadata) => {
      hasuraPermissionTypes.forEach((permissionType) => {
        const rolePermissions = tableMetadata[permissionType];

        if (!rolePermissions) {
          return;
        }

        rolePermissions.forEach((rolePermission) => {
          const roleValue = hasuraRoleToCaslPermissions[rolePermission.role];

          const action = actionTransformer?.(permissionType) ?? permissionType;

          const subject = subjectTransformer?.(tableMetadata.table.name) ?? tableMetadata.table.name;

          const fields = !rolePermission?.permission?.columns?.length ? null : rolePermission.permission.columns;

          const conditions = rolePermission?.permission?.filter ?? {};

          const caslPermission: CaslPermission = {
            action,
            subject,
            fields,
            conditions: this.utilsService.replaceHasuraSessionVars(conditions, {
              ...replacements,
              ...defaultMatcherReplacements
            }),
          };

          if (roleValue) {
            roleValue.push(caslPermission);

            return;
          }

          hasuraRoleToCaslPermissions[rolePermission.role] = [caslPermission];
        });
      });
    });

    await writeFile(join(process.cwd(), 'permissions.json'), JSON.stringify(hasuraRoleToCaslPermissions));
  }
}