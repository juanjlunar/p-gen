import { Injectable } from '@nestjs/common';
import { IHasuraRepository } from '../hasura/ihasura-repository.interface';
import type {
  CaslPermission,
  GenerateCaslPermissionsDto,
  PermissionsMappingByRole,
} from './types';
import { hasuraPermissionTypes } from '../hasura/constants/permissions.constant';
import { UtilsService } from '../utils/utils.service';
import { defaultMatcherReplacements } from '../hasura/constants/default-matcher-replacements.constant';
import { join } from 'path';
import type {
  HasuraMetadataSource,
  HasuraMetadataTable,
} from '../hasura/types';
import type { Config } from '../common/types';
import { LoggerService } from '../logger/logger.service';
import { InjectConfigOptions } from '../cosmiconfig/decorators/inject-config-options.decorator';
import { CaslPermissionTransformer } from './casl-permission-transformer/casl-permission-transformer';

@Injectable()
export class CaslService {
  constructor(
    private readonly hasuraRepository: IHasuraRepository,
    private readonly utilsService: UtilsService,
    private readonly loggerService: LoggerService,
    private readonly caslPermissionTransformer: CaslPermissionTransformer,
    @InjectConfigOptions() private readonly configOptions: Config,
  ) {}

  /**
   * Generate the Casl permissions from the Hasura permissions.
   *
   */
  async generateCaslPermissions(
    generateCaslPermissionsDto: GenerateCaslPermissionsDto,
  ): Promise<PermissionsMappingByRole> {
    const { dataSource, hasuraAdminSecret, hasuraEndpointUrl } =
      generateCaslPermissionsDto;

    const hasuraMetadata = await this.hasuraRepository.getHasuraMetadata({
      hasuraAdminSecret,
      hasuraEndpointUrl,
    });

    const currentDataSource = this.findDataSourceOrFail(
      hasuraMetadata.metadata.sources,
      dataSource,
    );

    return this.getPermissionsMapping(currentDataSource.tables);
  }

  /**
   * Export the permissions object to a JSON file in the current working directory.
   *
   */
  async exportToJSON(
    permissionsMapping: PermissionsMappingByRole | CaslPermission[],
  ) {
    const permissionsFilePath = join(process.cwd(), 'permissions.json');

    const permissionsData = JSON.stringify(permissionsMapping, null, ' ');

    await this.utilsService.writeFile(permissionsFilePath, permissionsData);

    this.loggerService.log(
      `Permissions created in ${permissionsFilePath}`,
      'CaslGeneratorCommand',
    );
  }

  /**
   * Find the data source from the Hasura metadata.
   *
   */
  private findDataSourceOrFail(
    dataSources: HasuraMetadataSource[],
    dataSource = 'default',
  ) {
    const currentDataSource = dataSources.find(
      (value) => value.name === dataSource,
    );

    if (!currentDataSource) {
      throw new Error(`DataSource ${currentDataSource} not found.`);
    }

    return currentDataSource;
  }

  /**
   * Resolve the permissions mapping by user role.
   *
   */
  private getPermissionsMapping(
    metadataTables: HasuraMetadataTable[],
  ): PermissionsMappingByRole {
    const {
      transformers: {
        action: actionTransformer = undefined,
        subject: subjectTransformer = undefined,
      } = {},
      replacements = {},
    } = this.configOptions;

    const hasuraRoleToCaslPermissions = {} as PermissionsMappingByRole;

    for (const tableMetadata of metadataTables) {
      for (const permissionType of hasuraPermissionTypes) {
        const rolePermissions = tableMetadata[permissionType];

        if (!rolePermissions) {
          continue;
        }

        for (const rolePermission of rolePermissions) {
          const roleValue = hasuraRoleToCaslPermissions[rolePermission.role];

          const action = actionTransformer?.(permissionType) ?? permissionType;

          const subject =
            subjectTransformer?.(tableMetadata.table.name) ??
            tableMetadata.table.name;

          const fields = !rolePermission?.permission?.columns?.length
            ? ['']
            : rolePermission.permission.columns;

          const conditions =
            rolePermission?.permission?.check ??
            rolePermission?.permission?.filter ??
            {};

          const newConditions = this.utilsService.replaceHasuraSessionVars(
            conditions,
            {
              ...replacements,
              ...defaultMatcherReplacements,
            },
          );

          const flattenedConditions =
            this.caslPermissionTransformer.caslify(newConditions);

          const caslPermission: CaslPermission = {
            action,
            subject,
            fields,
            conditions: flattenedConditions,
          };

          if (roleValue) {
            roleValue.push(caslPermission);

            continue;
          }

          hasuraRoleToCaslPermissions[rolePermission.role] = [caslPermission];
        }
      }
    }

    return hasuraRoleToCaslPermissions;
  }
}
