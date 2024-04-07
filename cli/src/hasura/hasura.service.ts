import { Injectable } from '@nestjs/common';
import type { HasuraMetadataTable } from './types';
import { type HasuraPermissionType } from './constants/permissions.constant';

@Injectable()
export class HasuraService {
  /**
   * Filter permissions.
   *
   */
  filterTablesMetadata(
    include: Record<string, HasuraPermissionType[]>,
    metadataTables: HasuraMetadataTable[],
  ): HasuraMetadataTable[] {
    const tablesToFilter = Object.keys(include);

    if (!tablesToFilter?.length) {
      return metadataTables;
    }

    const filteredTables: HasuraMetadataTable[] = [];

    metadataTables.forEach((metadataTable) => {
      const permissions = include[metadataTable.table.name];

      if (!permissions) {
        return;
      }

      if (!permissions.length) {
        filteredTables.push(metadataTable);

        return;
      }

      const metadataToInclude: HasuraMetadataTable = {
        table: metadataTable.table,
      };

      permissions.forEach((permission) => {
        metadataToInclude[permission] = metadataTable[permission];
      });

      filteredTables.push(metadataToInclude);
    });

    return filteredTables;
  }
}
