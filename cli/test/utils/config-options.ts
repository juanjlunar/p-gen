import type { Config } from '../../src/common/types';
import pluralize from 'pluralize';

export const configOptions: Config = {
  transformers: {
    action: (act: string) => {
      // Do your transformation.
      switch (act) {
        case 'insert_permissions':
          return 'INSERT';
        case 'update_permissions':
          return 'UPDATE';
        case 'select_permissions':
          return 'READ';
        case 'delete_permissions':
          return 'DELETE';

        default:
          return act;
      }
    },
    subject: (sub: string) => {
      // Do your transformation.
      return pluralize.singular(sub).toUpperCase();
    },
  },
  replacements: {
    // Example
    'x-hasura-user-id': '${user.id}',
  },
  include: {
    // users: ['insert_permissions'],
  },
};
