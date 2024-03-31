import { Test, TestingModule } from '@nestjs/testing';
import { CaslPermissionTransformer } from './casl-permission-transformer';

describe('CaslPermissionTransformer', () => {
  let service: CaslPermissionTransformer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaslPermissionTransformer],
    }).compile();

    service = module.get<CaslPermissionTransformer>(CaslPermissionTransformer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('caslify', () => {
    describe('when the Hasura permission object only includes one operator in a non-nested field', () => {
      it('should return the transformed permission just like it was received', async () => {
        const result = await service.caslify({ id: { $eq: '${user.id}' } });

        expect(result).toStrictEqual({ id: { $eq: '${user.id}' } });
      });
    });

    describe('when the Hasura permission includes a operator within a nested field', () => {
      it('should return the nested properties as a delimiter key Ex: key.key', async () => {
        const result = await service.caslify({
          user_roles: { role: { $eq: '${user.id}' } },
        });

        expect(result).toStrictEqual({
          'user_roles.role': { $eq: '${user.id}' },
        });
      });
    });

    describe('when the Hasura permission includes an array operator within a nested field', () => {
      it('should return the object with the operator value as formatted array with the rest of the key as a delimiter key Ex: key.key', async () => {
        const result = await service.caslify({
          user_roles: {
            $and: [
              {
                user: {
                  user_profile: {
                    user_id: {
                      $eq: '${user.id}',
                    },
                  },
                },
              },
            ],
          },
        });

        expect(result).toStrictEqual({
          $and: [
            {
              'user_roles.user.user_profile.user_id': {
                $eq: '${user.id}',
              },
            },
          ],
        });
      });
    });

    describe('when the main field is an array operator', () => {
      describe('when there are no more array operator keys in the array', () => {
        it('should return the object with the operator value as formatted array with the rest of the key as a delimiter key Ex: key.key', async () => {
          const result = await service.caslify({
            $and: [
              {
                user_roles: {
                  role: {
                    $eq: '${user.id}',
                  },
                },
              },
              {
                user_roles: {
                  role: {
                    $eq: '${user.id}',
                  },
                },
              },
            ],
          });

          expect(result).toStrictEqual({
            $and: [
              {
                'user_roles.role': {
                  $eq: '${user.id}',
                },
              },
              {
                'user_roles.role': {
                  $eq: '${user.id}',
                },
              },
            ],
          });
        });
      });

      describe('otherwise', () => {
        it('should return the object with the operator value as formatted array with the rest of the key as a delimiter key and the same for the nested array operators', async () => {
          const result = await service.caslify({
            $and: [
              {
                user_roles: {
                  role: {
                    $eq: '${user.id}',
                  },
                },
              },
              {
                $and: [
                  {
                    user_roles: {
                      user_id: {
                        $eq: '${user.id}',
                      },
                    },
                  },
                ],
              },
            ],
          });

          expect(result).toStrictEqual({
            $and: [
              {
                'user_roles.role': {
                  $eq: '${user.id}',
                },
              },
              {
                $and: [
                  {
                    'user_roles.user_id': {
                      $eq: '${user.id}',
                    },
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe('when the Hasura permission object has a _exists operator', () => {
      it('should return a casl compatible object', async () => {
        const result = await service.caslify({
          _exists: {
            _table: {
              name: 'users',
              schema: 'public',
            },
            _where: {
              id: {
                $eq: '${user.id}',
              },
            },
          },
        });

        expect(result).toStrictEqual({
          '_exists.users.id': {
            $eq: '${user.id}',
          },
        });
      });
    });

    describe('when the Hasura permission object has a _exists operator inside an array operator', () => {
      it('should return a casl compatible object', async () => {
        const result = await service.caslify({
          $and: [
            {
              id: {
                $eq: '${user.id}',
              },
            },
            {
              $and: [
                {
                  _exists: {
                    _table: {
                      name: 'users',
                      schema: 'public',
                    },
                    _where: {
                      user_roles: {
                        role: {
                          $eq: '${user.id}',
                        },
                      },
                    },
                  },
                },
              ],
            },
          ],
        });

        expect(result).toStrictEqual({
          $and: [
            {
              id: {
                $eq: '${user.id}',
              },
            },
            {
              $and: [
                {
                  '_exists.users.user_roles.role': {
                    $eq: '${user.id}',
                  },
                },
              ],
            },
          ],
        });
      });
    });

    describe('when the Hasura permission object has a nested $and operator', () => {
      it('should unnest the $and operators', async () => {
        const result = await service.caslify({
          _exists: {
            _table: {
              name: 'users',
              schema: 'public',
            },
            _where: {
              $and: [
                {
                  user_roles: {
                    role: {
                      $eq: 'x-hasura-user-id',
                    },
                  },
                },
                {
                  id: {
                    $eq: 'x-hasura-user-id',
                  },
                },
              ],
            },
          },
        });

        expect(result).toStrictEqual({
          $and: [
            {
              '_exists.users.user_roles.role': {
                $eq: 'x-hasura-user-id',
              },
            },
            {
              '_exists.users.id': {
                $eq: 'x-hasura-user-id',
              },
            },
          ],
        });
      });
    });

    describe('when the Hasura permission object has a nested $or operator inside a $and operator', () => {
      it('should unnest the $and operators', async () => {
        const result = await service.caslify({
          _exists: {
            _table: {
              name: 'users',
              schema: 'public',
            },
            _where: {
              $and: [
                {
                  user_roles: {
                    role: {
                      $eq: 'x-hasura-user-id',
                    },
                  },
                },
                {
                  $or: [
                    {
                      id: {
                        $eq: 'x-hasura-user-id',
                      },
                    },
                  ],
                },
              ],
            },
          },
        });

        expect(result).toStrictEqual({
          $and: [
            {
              '_exists.users.user_roles.role': {
                $eq: 'x-hasura-user-id',
              },
            },
            {
              $or: [
                {
                  '_exists.users.id': {
                    $eq: 'x-hasura-user-id',
                  },
                },
              ],
            },
          ],
        });
      });
    });

    describe('when the Hasura permission object has a nested $or operator inside a $and operator at a field level', () => {
      it('should unnest the $and operators', async () => {
        const result = await service.caslify({
          _exists: {
            _table: {
              name: 'users',
              schema: 'public',
            },
            _where: {
              $and: [
                {
                  user_roles: {
                    $or: [
                      {
                        user_id: {
                          $eq: 'x-hasura-user-id',
                        },
                      },
                      {
                        role: {
                          $eq: 'x-hasura-user-id',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        });

        expect(result).toStrictEqual({
          $and: [
            {
              $or: [
                {
                  '_exists.users.user_roles.user_id': {
                    $eq: 'x-hasura-user-id',
                  },
                },
                {
                  '_exists.users.user_roles.role': {
                    $eq: 'x-hasura-user-id',
                  },
                },
              ],
            },
          ],
        });
      });
    });

    describe('when the Hasura permission has a final array operator ($in, $nin)', () => {
      describe('when the $in array has only one value', () => {
        it('should return the unflattened array', async () => {
          const result = await service.caslify({
            user_roles: {
              role: {
                $in: ['ROLE1'],
              },
            },
          });

          expect(result).toStrictEqual({
            'user_roles.role': {
              $in: ['ROLE1'],
            },
          });
        });
      });

      describe('otherwise', () => {
        it('should return the unflattened array', async () => {
          const result = await service.caslify({
            user_roles: {
              role: {
                $in: ['ROLE1', 'ROLE2'],
              },
            },
          });

          expect(result).toStrictEqual({
            'user_roles.role': {
              $in: ['ROLE1', 'ROLE2'],
            },
          });
        });
      });
    });

    describe('when the Hasura permission object has an invalid format', () => {
      describe('when the object has a numeric key', async () => {
        it('should unnest the $and operators', async () => {
          const result = await service.caslify({
            user_id: {
              _and: [
                {
                  asd: {
                    0: {
                      $eq: 'x-hasura-user-id',
                    },
                  },
                },
              ],
            },
          });

          expect(result).toStrictEqual({
            'user_id._and.0.asd.0': {
              $eq: 'x-hasura-user-id',
            },
          });
        });
      });
    });

    describe('when the Hasura permission object does not have a condition', () => {
      it('should return an empty object as condition', async () => {
        const result = await service.caslify({});

        expect(result).toStrictEqual({});
      });
    });
  });
});
