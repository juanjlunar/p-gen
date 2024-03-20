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
import { DEFAULT_HASURA_ENDPOINT_URL } from '../hasura/constants';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CaslService {
  constructor(
    private readonly hasuraRepository: IHasuraRepository,
    private readonly utilsService: UtilsService,
    private readonly loggerService: LoggerService,
  ) {}

  /**
   * Generate the Casl permissions from the Hasura permissions.
   *
   */
  async generateCaslPermissions(
    generateCaslPermissionsDto: GenerateCaslPermissionsDto,
  ) {
    const {
      config,
      args: { hasuraAdminSecret },
      options: {
        dataSource = 'default',
        hasuraEndpointUrl = DEFAULT_HASURA_ENDPOINT_URL,
      },
    } = generateCaslPermissionsDto;

    const hasuraMetadata = await this.hasuraRepository.getHasuraMetadata({
      hasuraAdminSecret,
      hasuraEndpointUrl,
    });

    const currentDataSource = this.findDataSourceOrFail(
      hasuraMetadata.metadata.sources,
      dataSource,
    );

    const hasuraRoleToCaslPermissions = this.getPermissionsMapping(
      currentDataSource.tables,
      config,
    );

    const permissionsFilePath = join(process.cwd(), 'permissions.json');

    const permissionsData = JSON.stringify(
      hasuraRoleToCaslPermissions,
      null,
      ' ',
    );

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
    tableMetadata: HasuraMetadataTable[],
    config: Config,
  ): PermissionsMappingByRole {
    const {
      transformers: {
        action: actionTransformer = undefined,
        subject: subjectTransformer = undefined,
      } = {},
      replacements = {},
    } = config ?? {};

    const hasuraRoleToCaslPermissions = {} as PermissionsMappingByRole;

    tableMetadata.forEach((tableMetadata) => {
      hasuraPermissionTypes.forEach((permissionType) => {
        const rolePermissions = tableMetadata[permissionType];

        if (!rolePermissions) {
          return;
        }

        rolePermissions.forEach((rolePermission) => {
          const roleValue = hasuraRoleToCaslPermissions[rolePermission.role];

          const action = actionTransformer?.(permissionType) ?? permissionType;

          const subject =
            subjectTransformer?.(tableMetadata.table.name) ??
            tableMetadata.table.name;

          const fields = !rolePermission?.permission?.columns?.length
            ? null
            : rolePermission.permission.columns;

          const conditions = rolePermission?.permission?.filter ?? {};

          const caslPermission: CaslPermission = {
            action,
            subject,
            fields,
            conditions: this.utilsService.replaceHasuraSessionVars(conditions, {
              ...replacements,
              ...defaultMatcherReplacements,
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

    return hasuraRoleToCaslPermissions;
  }
}
