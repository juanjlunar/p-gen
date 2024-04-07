import { Test, TestingModule } from '@nestjs/testing';
import { HasuraService } from './hasura.service';
import type { HasuraMetadataTable } from './types';

const mock = [
  {
    table: {
      name: 'roles',
      schema: 'public',
    },
    is_enum: true,
    select_permissions: [
      {
        role: 'user',
        permission: {
          columns: [],
          filter: {},
        },
        comment: '',
      },
    ],
    insert_permissions: [
      {
        role: 'user',
        permission: {
          check: {
            id: {
              _eq: 'X-Hasura-User-Id',
            },
          },
          columns: [],
        },
        comment: '',
      },
    ],
  },
  {
    table: {
      name: 'user_roles',
      schema: 'public',
    },
  },
  {
    table: {
      name: 'users',
      schema: 'public',
    },
    array_relationships: [
      {
        name: 'user_roles',
        using: {
          foreign_key_constraint_on: {
            column: 'user_id',
            table: {
              name: 'user_roles',
              schema: 'public',
            },
          },
        },
      },
    ],
  },
] as HasuraMetadataTable[];

describe('HasuraService', () => {
  let service: HasuraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HasuraService],
    }).compile();

    service = module.get<HasuraService>(HasuraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('filterTablesMetadata', () => {
    describe('when there is no property set in the include argument', () => {
      it('should return the same tables received as argument', () => {
        const result = service.filterTablesMetadata({}, mock);

        expect(result).toStrictEqual(mock);
      });
    });

    describe('otherwise', () => {
      describe('when the table exists in the include object but it is an empty array', () => {
        it('should return the entire table metadata', () => {
          const permissionsMock = [...mock];

          const result = service.filterTablesMetadata(
            {
              roles: [],
            },
            permissionsMock,
          );

          const roleTableMock = mock[0];

          expect(result).toStrictEqual([roleTableMock]);
        });
      });

      describe('otherwise', () => {
        it('should return only the specified permissions in the include argument', () => {
          const result = service.filterTablesMetadata(
            {
              roles: ['select_permissions'],
            },
            mock,
          );

          const permissionsMock = mock[0];

          expect(result).toStrictEqual([
            {
              table: permissionsMock.table,
              select_permissions: permissionsMock.select_permissions,
            },
          ]);
        });
      });
    });
  });
});
