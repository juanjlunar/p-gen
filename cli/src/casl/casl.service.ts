import { Injectable } from '@nestjs/common';
import { IHasuraRepository } from '../hasura/ihasura-repository.interface';
import type {
  CaslPermission,
  ExportToJSONOptions,
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
import { LoggerService } from '../logger/logger.service';
import { CaslPermissionTransformer } from './casl-permission-transformer/casl-permission-transformer';
import { HasuraService } from '../hasura/hasura.service';
import { ConfigService } from '../cosmiconfig/config/config.service';

@Injectable()
export class CaslService {
  constructor(
    private readonly hasuraRepository: IHasuraRepository,
    private readonly hasuraService: HasuraService,
    private readonly utilsService: UtilsService,
    private readonly loggerService: LoggerService,
    private readonly caslPermissionTransformer: CaslPermissionTransformer,
    private readonly configService: ConfigService,
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

    const { include = {} } = this.configService.getConfig();

    const hasuraMetadata = await this.hasuraRepository.getHasuraMetadata({
      hasuraAdminSecret,
      hasuraEndpointUrl,
    });

    const currentDataSource = this.findDataSourceOrFail(
      hasuraMetadata.metadata.sources,
      dataSource,
    );

    const filteredTablesMetadata = this.hasuraService.filterTablesMetadata(
      include,
      currentDataSource.tables,
    );

    return this.getPermissionsMapping(filteredTablesMetadata);
  }

  /**
   * Export the permissions object to a JSON file in the current working directory.
   *
   */
  async exportToJSON(
    permissionsMapping: PermissionsMappingByRole | CaslPermission[],
    options = {} as ExportToJSONOptions,
  ) {
    const { path = process.cwd() } = options;

    const permissionsFilePath = join(path, 'permissions.json');

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
    } = this.configService.getConfig();

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
