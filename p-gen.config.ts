import { Config } from './src/types';

const config: Config = {
  transformers: {
    action: (act) => {
      return act.toUpperCase();
    },
    subject: (sub) => {
      return sub.toUpperCase();
    }
  },
  replacements: {
    'x-hasura-user-id': '${user.id}',
    'x-hasura-default-role': '${user.default_user_role}',
    'x-hasura-role': '${user.user_role}',
  }
}

export default config;