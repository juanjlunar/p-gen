import { TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { CommandTestFactory } from 'nest-commander-testing';
import { loadPermissions } from './utils/load-permissions.util';
import { Subjects, defineAbilityfor } from './utils/define-casl-ability-for';
import { removePermissions } from './utils/remove-permissions.util';
import { IHasuraRepository } from '../src/hasura/ihasura-repository.interface';
import { dropPermissionsSilent } from './utils/drop-permissions-silent.util';

const options = {
  hasuraAdminSecret: 'secret',
  hasuraEndpointUrl: 'http://localhost:8100/v1/metadata',
};

describe('CaslGeneratorCommand (e2e)', () => {
  let commandModule: TestingModule;

  let hasuraRepository: IHasuraRepository;

  beforeEach(async () => {
    commandModule = await CommandTestFactory.createTestingCommand({
      imports: [AppModule],
    }).compile();

    hasuraRepository = commandModule.get(IHasuraRepository);
  });

  afterEach(async () => {
    await removePermissions();

    await dropPermissionsSilent(hasuraRepository, {
      type: 'pg_drop_select_permission',
      table: 'users',
      role: 'user',
      headers: options,
    });

    await dropPermissionsSilent(hasuraRepository, {
      type: 'pg_drop_insert_permission',
      table: 'users',
      role: 'user',
      headers: options,
    });

    await dropPermissionsSilent(hasuraRepository, {
      type: 'pg_drop_update_permission',
      table: 'users',
      role: 'user',
      headers: options,
    });

    await dropPermissionsSilent(hasuraRepository, {
      type: 'pg_drop_delete_permission',
      table: 'users',
      role: 'user',
      headers: options,
    });
  });

  beforeAll(async () => {
    await removePermissions();
  });

  afterAll(async () => {
    await removePermissions();
  });

  describe('READ', () => {
    describe('when _exists operator is used', () => {
      test('exists table "user_roles" where "role" equals to "ADMIN"', async () => {
        await hasuraRepository.createSelectPermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  role: {
                    _eq: 'ADMIN',
                  },
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('READ', userInstance);

        expect(test).toBe(true);
      });

      test('exists table "user_roles" where "role" in ["ADMIN", "SUPER_ADMIN"]', async () => {
        await hasuraRepository.createSelectPermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  role: {
                    _in: ['ADMIN', 'SUPER_ADMIN'],
                  },
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('READ', userInstance);

        expect(test).toBe(true);
      });

      test('exists table "user_roles" where "role" in ["ADMIN"] and "user_id" equals to x-hasura-user-id', async () => {
        await hasuraRepository.createSelectPermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  _and: [
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                    {
                      role: {
                        _in: ['ADMIN'],
                      },
                    },
                  ],
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('READ', userInstance);

        expect(test).toBe(true);
      });

      test('exists table "user_roles" where "role" in ["ADMIN"] or "user_id" equals to x-hasura-user-id', async () => {
        await hasuraRepository.createSelectPermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  _or: [
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                    {
                      role: {
                        _in: ['ADMIN'],
                      },
                    },
                  ],
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                user_id: '2',
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('READ', userInstance);

        expect(test).toBe(true);
      });
    });

    describe('otherwise', () => {
      test('"id" is equal to x-hasura-user-id', async () => {
        await hasuraRepository.createSelectPermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              id: {
                _eq: 'x-hasura-user-id',
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [{ role: 'ADMIN', user_id: '1' }],
          },
          permissionsJSON,
        );

        const test = appAbility.can('READ', {
          __customSubject: Subjects.User,
          id: '1',
        });

        expect(test).toBe(true);
      });

      describe('when there is a $and operator as root permission', () => {
        test('and "id" is equal to x-hasura-user-id and "role" is equal to ADMIN', async () => {
          await hasuraRepository.createSelectPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    user_roles: {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('READ', {
            __customSubject: Subjects.User,
            id: '1',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator as root permission', () => {
        test('or "id" is equal to x-hasura-user-id or "role" is equal to ADMIN', async () => {
          await hasuraRepository.createSelectPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _or: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    user_roles: {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('READ', {
            __customSubject: Subjects.User,
            id: '1',
            user_roles: [
              {
                role: 'SUPER_ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $and operator as root permission and a $and operator inside', () => {
        test('and "id" is equal to x-hasura-user-id and "user_roles.role" is equal to ADMIN', async () => {
          await hasuraRepository.createSelectPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _and: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('READ', {
            __customSubject: Subjects.User,
            id: '1',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $and operator as root permission and a $or operator inside', () => {
        test('and "id" is equal to x-hasura-user-id or "user_roles.role" is equal to ADMIN or email is equal to test@test.com', async () => {
          await hasuraRepository.createSelectPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _or: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                      {
                        email: {
                          _eq: 'test@test.com',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('READ', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'SUPER_ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator as root permission and a $and operator inside', () => {
        test('or "id" is equal to x-hasura-user-id or and "user_roles.role" is equal to ADMIN and email is equal to test@test.com', async () => {
          await hasuraRepository.createSelectPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _or: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _and: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                      {
                        email: {
                          _eq: 'test@test.com',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('READ', {
            __customSubject: Subjects.User,
            id: '2',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator as root permission and a $or operator inside', () => {
        test('or "id" is equal to x-hasura-user-id or "user_roles.role" is equal to ADMIN or email is equal to test@test.com', async () => {
          await hasuraRepository.createSelectPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _or: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _or: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                      {
                        email: {
                          _eq: 'test@test.com',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('READ', {
            __customSubject: Subjects.User,
            id: '2',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $and operator nested at a field level', () => {
        test('"user_roles" and user_id is equal to x-hasura-user-id and role is equal to "ADMIN"', async () => {
          await hasuraRepository.createSelectPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                user_roles: {
                  _and: [
                    {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                  ],
                },
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('READ', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator nested at a field level', () => {
        test('"user_roles" or user_id is equal to x-hasura-user-id or role is equal to "ADMIN"', async () => {
          await hasuraRepository.createSelectPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                user_roles: {
                  _or: [
                    {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                  ],
                },
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('READ', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '2',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a "$and" operator as root and a "$and" nested at field level', () => {
        test('and ["user_roles" and [user_id is equal to x-hasura-user-id and role is equal to "ADMIN", email is equal to test@test.com]]', async () => {
          await hasuraRepository.createSelectPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    user_roles: {
                      _and: [
                        {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                        {
                          user_id: {
                            _eq: 'x-hasura-user-id',
                          },
                        },
                      ],
                    },
                  },
                  {
                    email: {
                      $eq: 'test@test.com',
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('READ', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a "$and" operator as root and a "$or" nested at field level', () => {
        test('and ["user_roles" or [user_id is equal to x-hasura-user-id and role is equal to "ADMIN", email is equal to test@test.com]]', async () => {
          await hasuraRepository.createSelectPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    user_roles: {
                      _or: [
                        {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                        {
                          user_id: {
                            _eq: 'x-hasura-user-id',
                          },
                        },
                      ],
                    },
                  },
                  {
                    email: {
                      $eq: 'test@test.com',
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('READ', {
            __customSubject: Subjects.User,
            id: '2',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '2',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });
    });
  });

  describe('INSERT', () => {
    describe('when _exists operator is used', () => {
      test('exists table "user_roles" where "role" equals to "ADMIN"', async () => {
        await hasuraRepository.createInsertPermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            check: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  role: {
                    _eq: 'ADMIN',
                  },
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('INSERT', userInstance);

        expect(test).toBe(true);
      });

      test('exists table "user_roles" where "role" in ["ADMIN", "SUPER_ADMIN"]', async () => {
        await hasuraRepository.createInsertPermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            check: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  role: {
                    _in: ['ADMIN', 'SUPER_ADMIN'],
                  },
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('INSERT', userInstance);

        expect(test).toBe(true);
      });

      test('exists table "user_roles" where "role" in ["ADMIN"] and "user_id" equals to x-hasura-user-id', async () => {
        await hasuraRepository.createInsertPermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            check: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  _and: [
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                    {
                      role: {
                        _in: ['ADMIN'],
                      },
                    },
                  ],
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('INSERT', userInstance);

        expect(test).toBe(true);
      });

      test('exists table "user_roles" where "role" in ["ADMIN"] or "user_id" equals to x-hasura-user-id', async () => {
        await hasuraRepository.createInsertPermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            check: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  _or: [
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                    {
                      role: {
                        _in: ['ADMIN'],
                      },
                    },
                  ],
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                user_id: '2',
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('INSERT', userInstance);

        expect(test).toBe(true);
      });
    });

    describe('otherwise', () => {
      test('"id" is equal to x-hasura-user-id', async () => {
        await hasuraRepository.createInsertPermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            check: {
              id: {
                _eq: 'x-hasura-user-id',
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [{ role: 'ADMIN', user_id: '1' }],
          },
          permissionsJSON,
        );

        const test = appAbility.can('INSERT', {
          __customSubject: Subjects.User,
          id: '1',
        });

        expect(test).toBe(true);
      });

      describe('when there is a $and operator as root permission', () => {
        test('and "id" is equal to x-hasura-user-id and "role" is equal to ADMIN', async () => {
          await hasuraRepository.createInsertPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              check: {
                _and: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    user_roles: {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('INSERT', {
            __customSubject: Subjects.User,
            id: '1',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator as root permission', () => {
        test('or "id" is equal to x-hasura-user-id or "role" is equal to ADMIN', async () => {
          await hasuraRepository.createInsertPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              check: {
                _or: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    user_roles: {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('INSERT', {
            __customSubject: Subjects.User,
            id: '1',
            user_roles: [
              {
                role: 'SUPER_ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $and operator as root permission and a $and operator inside', () => {
        test('and "id" is equal to x-hasura-user-id and "user_roles.role" is equal to ADMIN', async () => {
          await hasuraRepository.createInsertPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              check: {
                _and: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _and: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('INSERT', {
            __customSubject: Subjects.User,
            id: '1',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $and operator as root permission and a $or operator inside', () => {
        test('and "id" is equal to x-hasura-user-id or "user_roles.role" is equal to ADMIN or email is equal to test@test.com', async () => {
          await hasuraRepository.createInsertPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              check: {
                _and: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _or: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                      {
                        email: {
                          _eq: 'test@test.com',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('INSERT', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'SUPER_ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator as root permission and a $and operator inside', () => {
        test('or "id" is equal to x-hasura-user-id or and "user_roles.role" is equal to ADMIN and email is equal to test@test.com', async () => {
          await hasuraRepository.createInsertPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              check: {
                _or: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _and: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                      {
                        email: {
                          _eq: 'test@test.com',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('INSERT', {
            __customSubject: Subjects.User,
            id: '2',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator as root permission and a $or operator inside', () => {
        test('or "id" is equal to x-hasura-user-id or "user_roles.role" is equal to ADMIN or email is equal to test@test.com', async () => {
          await hasuraRepository.createInsertPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              check: {
                _or: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _or: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                      {
                        email: {
                          _eq: 'test@test.com',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('INSERT', {
            __customSubject: Subjects.User,
            id: '2',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $and operator nested at a field level', () => {
        test('"user_roles" and user_id is equal to x-hasura-user-id and role is equal to "ADMIN"', async () => {
          await hasuraRepository.createInsertPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              check: {
                user_roles: {
                  _and: [
                    {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                  ],
                },
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('INSERT', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator nested at a field level', () => {
        test('"user_roles" or user_id is equal to x-hasura-user-id or role is equal to "ADMIN"', async () => {
          await hasuraRepository.createInsertPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              check: {
                user_roles: {
                  _or: [
                    {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                  ],
                },
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('INSERT', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '2',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a "$and" operator as root and a "$and" nested at field level', () => {
        test('and ["user_roles" and [user_id is equal to x-hasura-user-id and role is equal to "ADMIN", email is equal to test@test.com]]', async () => {
          await hasuraRepository.createInsertPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              check: {
                _and: [
                  {
                    user_roles: {
                      _and: [
                        {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                        {
                          user_id: {
                            _eq: 'x-hasura-user-id',
                          },
                        },
                      ],
                    },
                  },
                  {
                    email: {
                      $eq: 'test@test.com',
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('INSERT', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a "$and" operator as root and a "$or" nested at field level', () => {
        test('and ["user_roles" or [user_id is equal to x-hasura-user-id and role is equal to "ADMIN", email is equal to test@test.com]]', async () => {
          await hasuraRepository.createInsertPermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              check: {
                _and: [
                  {
                    user_roles: {
                      _or: [
                        {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                        {
                          user_id: {
                            _eq: 'x-hasura-user-id',
                          },
                        },
                      ],
                    },
                  },
                  {
                    email: {
                      $eq: 'test@test.com',
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('INSERT', {
            __customSubject: Subjects.User,
            id: '2',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '2',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });
    });
  });

  describe('UPDATE', () => {
    describe('when _exists operator is used', () => {
      test('exists table "user_roles" where "role" equals to "ADMIN"', async () => {
        await hasuraRepository.createUpdatePermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  role: {
                    _eq: 'ADMIN',
                  },
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('UPDATE', userInstance);

        expect(test).toBe(true);
      });

      test('exists table "user_roles" where "role" in ["ADMIN", "SUPER_ADMIN"]', async () => {
        await hasuraRepository.createUpdatePermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  role: {
                    _in: ['ADMIN', 'SUPER_ADMIN'],
                  },
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('UPDATE', userInstance);

        expect(test).toBe(true);
      });

      test('exists table "user_roles" where "role" in ["ADMIN"] and "user_id" equals to x-hasura-user-id', async () => {
        await hasuraRepository.createUpdatePermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  _and: [
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                    {
                      role: {
                        _in: ['ADMIN'],
                      },
                    },
                  ],
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('UPDATE', userInstance);

        expect(test).toBe(true);
      });

      test('exists table "user_roles" where "role" in ["ADMIN"] or "user_id" equals to x-hasura-user-id', async () => {
        await hasuraRepository.createUpdatePermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  _or: [
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                    {
                      role: {
                        _in: ['ADMIN'],
                      },
                    },
                  ],
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                user_id: '2',
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('UPDATE', userInstance);

        expect(test).toBe(true);
      });
    });

    describe('otherwise', () => {
      test('"id" is equal to x-hasura-user-id', async () => {
        await hasuraRepository.createUpdatePermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              id: {
                _eq: 'x-hasura-user-id',
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [{ role: 'ADMIN', user_id: '1' }],
          },
          permissionsJSON,
        );

        const test = appAbility.can('UPDATE', {
          __customSubject: Subjects.User,
          id: '1',
        });

        expect(test).toBe(true);
      });

      describe('when there is a $and operator as root permission', () => {
        test('and "id" is equal to x-hasura-user-id and "role" is equal to ADMIN', async () => {
          await hasuraRepository.createUpdatePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    user_roles: {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('UPDATE', {
            __customSubject: Subjects.User,
            id: '1',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator as root permission', () => {
        test('or "id" is equal to x-hasura-user-id or "role" is equal to ADMIN', async () => {
          await hasuraRepository.createUpdatePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _or: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    user_roles: {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('UPDATE', {
            __customSubject: Subjects.User,
            id: '1',
            user_roles: [
              {
                role: 'SUPER_ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $and operator as root permission and a $and operator inside', () => {
        test('and "id" is equal to x-hasura-user-id and "user_roles.role" is equal to ADMIN', async () => {
          await hasuraRepository.createUpdatePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _and: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('UPDATE', {
            __customSubject: Subjects.User,
            id: '1',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $and operator as root permission and a $or operator inside', () => {
        test('and "id" is equal to x-hasura-user-id or "user_roles.role" is equal to ADMIN or email is equal to test@test.com', async () => {
          await hasuraRepository.createUpdatePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _or: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                      {
                        email: {
                          _eq: 'test@test.com',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('UPDATE', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'SUPER_ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator as root permission and a $and operator inside', () => {
        test('or "id" is equal to x-hasura-user-id or and "user_roles.role" is equal to ADMIN and email is equal to test@test.com', async () => {
          await hasuraRepository.createUpdatePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _or: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _and: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                      {
                        email: {
                          _eq: 'test@test.com',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('UPDATE', {
            __customSubject: Subjects.User,
            id: '2',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator as root permission and a $or operator inside', () => {
        test('or "id" is equal to x-hasura-user-id or "user_roles.role" is equal to ADMIN or email is equal to test@test.com', async () => {
          await hasuraRepository.createUpdatePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _or: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _or: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                      {
                        email: {
                          _eq: 'test@test.com',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('UPDATE', {
            __customSubject: Subjects.User,
            id: '2',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $and operator nested at a field level', () => {
        test('"user_roles" and user_id is equal to x-hasura-user-id and role is equal to "ADMIN"', async () => {
          await hasuraRepository.createUpdatePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                user_roles: {
                  _and: [
                    {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                  ],
                },
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('UPDATE', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator nested at a field level', () => {
        test('"user_roles" or user_id is equal to x-hasura-user-id or role is equal to "ADMIN"', async () => {
          await hasuraRepository.createUpdatePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                user_roles: {
                  _or: [
                    {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                  ],
                },
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('UPDATE', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '2',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a "$and" operator as root and a "$and" nested at field level', () => {
        test('and ["user_roles" and [user_id is equal to x-hasura-user-id and role is equal to "ADMIN", email is equal to test@test.com]]', async () => {
          await hasuraRepository.createUpdatePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    user_roles: {
                      _and: [
                        {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                        {
                          user_id: {
                            _eq: 'x-hasura-user-id',
                          },
                        },
                      ],
                    },
                  },
                  {
                    email: {
                      $eq: 'test@test.com',
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('UPDATE', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a "$and" operator as root and a "$or" nested at field level', () => {
        test('and ["user_roles" or [user_id is equal to x-hasura-user-id and role is equal to "ADMIN", email is equal to test@test.com]]', async () => {
          await hasuraRepository.createUpdatePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    user_roles: {
                      _or: [
                        {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                        {
                          user_id: {
                            _eq: 'x-hasura-user-id',
                          },
                        },
                      ],
                    },
                  },
                  {
                    email: {
                      $eq: 'test@test.com',
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('UPDATE', {
            __customSubject: Subjects.User,
            id: '2',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '2',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });
    });
  });

  describe('DELETE', () => {
    describe('when _exists operator is used', () => {
      test('exists table "user_roles" where "role" equals to "ADMIN"', async () => {
        await hasuraRepository.createDeletePermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  role: {
                    _eq: 'ADMIN',
                  },
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('DELETE', userInstance);

        expect(test).toBe(true);
      });

      test('exists table "user_roles" where "role" in ["ADMIN", "SUPER_ADMIN"]', async () => {
        await hasuraRepository.createDeletePermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  role: {
                    _in: ['ADMIN', 'SUPER_ADMIN'],
                  },
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('DELETE', userInstance);

        expect(test).toBe(true);
      });

      test('exists table "user_roles" where "role" in ["ADMIN"] and "user_id" equals to x-hasura-user-id', async () => {
        await hasuraRepository.createDeletePermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  _and: [
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                    {
                      role: {
                        _in: ['ADMIN'],
                      },
                    },
                  ],
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('DELETE', userInstance);

        expect(test).toBe(true);
      });

      test('exists table "user_roles" where "role" in ["ADMIN"] or "user_id" equals to x-hasura-user-id', async () => {
        await hasuraRepository.createDeletePermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              _exists: {
                _table: {
                  schema: 'public',
                  name: 'user_roles',
                },
                _where: {
                  _or: [
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                    {
                      role: {
                        _in: ['ADMIN'],
                      },
                    },
                  ],
                },
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [
              {
                user_id: '1',
                role: 'ADMIN',
              },
            ],
          },
          permissionsJSON,
        );

        const userInstance = {
          __customSubject: Subjects.User,
        };

        // Monkey patching _db._exists to work around the Hasura _exists
        Object.assign(userInstance, {
          _exists: {
            user_roles: [
              {
                user_id: '2',
                role: 'ADMIN',
              },
            ],
          },
        });

        const test = appAbility.can('DELETE', userInstance);

        expect(test).toBe(true);
      });
    });

    describe('otherwise', () => {
      test('"id" is equal to x-hasura-user-id', async () => {
        await hasuraRepository.createDeletePermission({
          table: 'users',
          role: 'user',
          permission: {
            columns: ['id'],
            filter: {
              id: {
                _eq: 'x-hasura-user-id',
              },
            },
          },
          headers: options,
        });

        await CommandTestFactory.run(commandModule, [
          '-s',
          options.hasuraAdminSecret,
          '-he',
          options.hasuraEndpointUrl,
          '-f',
          'true',
        ]);

        const permissionsJSON = await loadPermissions();

        const appAbility = defineAbilityfor(
          {
            id: '1',
            user_roles: [{ role: 'ADMIN', user_id: '1' }],
          },
          permissionsJSON,
        );

        const test = appAbility.can('DELETE', {
          __customSubject: Subjects.User,
          id: '1',
        });

        expect(test).toBe(true);
      });

      describe('when there is a $and operator as root permission', () => {
        test('and "id" is equal to x-hasura-user-id and "role" is equal to ADMIN', async () => {
          await hasuraRepository.createDeletePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    user_roles: {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('DELETE', {
            __customSubject: Subjects.User,
            id: '1',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator as root permission', () => {
        test('or "id" is equal to x-hasura-user-id or "role" is equal to ADMIN', async () => {
          await hasuraRepository.createDeletePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _or: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    user_roles: {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('DELETE', {
            __customSubject: Subjects.User,
            id: '1',
            user_roles: [
              {
                role: 'SUPER_ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $and operator as root permission and a $and operator inside', () => {
        test('and "id" is equal to x-hasura-user-id and "user_roles.role" is equal to ADMIN', async () => {
          await hasuraRepository.createDeletePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _and: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('DELETE', {
            __customSubject: Subjects.User,
            id: '1',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $and operator as root permission and a $or operator inside', () => {
        test('and "id" is equal to x-hasura-user-id or "user_roles.role" is equal to ADMIN or email is equal to test@test.com', async () => {
          await hasuraRepository.createDeletePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _or: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                      {
                        email: {
                          _eq: 'test@test.com',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('DELETE', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'SUPER_ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator as root permission and a $and operator inside', () => {
        test('or "id" is equal to x-hasura-user-id or and "user_roles.role" is equal to ADMIN and email is equal to test@test.com', async () => {
          await hasuraRepository.createDeletePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _or: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _and: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                      {
                        email: {
                          _eq: 'test@test.com',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('DELETE', {
            __customSubject: Subjects.User,
            id: '2',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator as root permission and a $or operator inside', () => {
        test('or "id" is equal to x-hasura-user-id or "user_roles.role" is equal to ADMIN or email is equal to test@test.com', async () => {
          await hasuraRepository.createDeletePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _or: [
                  {
                    id: {
                      _eq: 'x-hasura-user-id',
                    },
                  },
                  {
                    _or: [
                      {
                        user_roles: {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                      },
                      {
                        email: {
                          _eq: 'test@test.com',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('DELETE', {
            __customSubject: Subjects.User,
            id: '2',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $and operator nested at a field level', () => {
        test('"user_roles" and user_id is equal to x-hasura-user-id and role is equal to "ADMIN"', async () => {
          await hasuraRepository.createDeletePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                user_roles: {
                  _and: [
                    {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                  ],
                },
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('DELETE', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a $or operator nested at a field level', () => {
        test('"user_roles" or user_id is equal to x-hasura-user-id or role is equal to "ADMIN"', async () => {
          await hasuraRepository.createDeletePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                user_roles: {
                  _or: [
                    {
                      role: {
                        _eq: 'ADMIN',
                      },
                    },
                    {
                      user_id: {
                        _eq: 'x-hasura-user-id',
                      },
                    },
                  ],
                },
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('DELETE', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '2',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a "$and" operator as root and a "$and" nested at field level', () => {
        test('and ["user_roles" and [user_id is equal to x-hasura-user-id and role is equal to "ADMIN", email is equal to test@test.com]]', async () => {
          await hasuraRepository.createDeletePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    user_roles: {
                      _and: [
                        {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                        {
                          user_id: {
                            _eq: 'x-hasura-user-id',
                          },
                        },
                      ],
                    },
                  },
                  {
                    email: {
                      $eq: 'test@test.com',
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('DELETE', {
            __customSubject: Subjects.User,
            id: '1',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '1',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });

      describe('when there is a "$and" operator as root and a "$or" nested at field level', () => {
        test('and ["user_roles" or [user_id is equal to x-hasura-user-id and role is equal to "ADMIN", email is equal to test@test.com]]', async () => {
          await hasuraRepository.createDeletePermission({
            table: 'users',
            role: 'user',
            permission: {
              columns: ['id'],
              filter: {
                _and: [
                  {
                    user_roles: {
                      _or: [
                        {
                          role: {
                            _eq: 'ADMIN',
                          },
                        },
                        {
                          user_id: {
                            _eq: 'x-hasura-user-id',
                          },
                        },
                      ],
                    },
                  },
                  {
                    email: {
                      $eq: 'test@test.com',
                    },
                  },
                ],
              },
            },
            headers: options,
          });

          await CommandTestFactory.run(commandModule, [
            '-s',
            options.hasuraAdminSecret,
            '-he',
            options.hasuraEndpointUrl,
            '-f',
            'true',
          ]);

          const permissionsJSON = await loadPermissions();

          const appAbility = defineAbilityfor(
            {
              id: '1',
              user_roles: [
                {
                  role: 'ADMIN',
                  user_id: '1',
                },
              ],
            },
            permissionsJSON,
          );

          const test = appAbility.can('DELETE', {
            __customSubject: Subjects.User,
            id: '2',
            email: 'test@test.com',
            user_roles: [
              {
                role: 'ADMIN',
                user_id: '2',
              },
            ],
          });

          expect(test).toBe(true);
        });
      });
    });
  });
});
