<p align="center">
  <a href="https://www.npmjs.com/package/@lunarj/p-gen" target="_blank">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/%40lunarj%2Fp-gen">
  </a>
  <a href="https://www.npmjs.com/package/@lunarj/p-gen" target="_blank">
    <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/%40lunarj%2Fp-gen">
  </a>
  <span>
    <img alt="NPM License" src="https://img.shields.io/npm/l/%40lunarj%2Fp-gen">
  </span>
</p>

## Description

A CLI to generate Casl permissions from a Hasura server.

## Installation

### NPM

```bash
npm i @lunarj/p-gen -D
```

### Yarn
```bash
yarn add @lunarj/p-gen -D
```

## Options

`-s, --hasura-admin-secret` indicates your Hasura server admin secret to connect to.

`-ds, --data-source` indicates the Hasura data source to fetch the permissions from. Defaults to "default"

`-he, --hasura-endpoint-url` indicates the Hasura server's location. Defaults to http://localhost:8080/v1/metadata, it is required to provide the full url including the /v1/metadata.

`-f, --flat` generates permissions without the Hasura roles mapping. It will be a plain array with the permissions without the role separation.

`-jp, --json-path` indicates the custom location to export the permissions JSON file.

`-h, --help` prints the help on the terminal

## Understanding the config

There are 2 ways to generate the config file:

1- Run the CLI against a Hasura instance, the config file will be automatically generated for you with default values, customize the file, and then re-run the CLI to overwrite the previously created permissions.

2- You can manually generate the `p-gen.config.ts` file in the project root directory with the following content:

`p-gen.config.ts`

```
import type { Config } from 'p-gen';

const config: Config = {
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
      return sub;
    },
  },
  replacements: {
    // Example
    'x-hasura-user-id': '${user.id}',
  },
  include: {
    // tableName: ['select_permissions']
  }
};

export default config;

```

The `action` property is used to customize the Casl action property. This function is called for every permission receiving the Hasura permission type as a parameter (insert_permissions, update_permissions, select_permissions, or delete_permissions)

The `subject` property is used to customize the Casl subject property. This function is called for every permission receiving the Hasura data source table as a parameter.

The `include` property filters the permissions you need to transform.

`p-gen.config.ts`
```
  {
    include: {
      users: ['insert_permissions']
    }
  }
```

In this example, the CLI will generate only the insert permissions from the user's table.

The `replacements` property is used to replace Hasura permission operators or session variables with custom values, for example: a permission using the X-Hasura-User-Id session variable will be replaced with '${user.id}' in the config shown above.

By default, the following operators will be transformed:

```
  _and: '$and',
  _or: '$or',
  _not: '$not',
  _eq: '$eq',
  _neq: '$ne',
  _in: '$in',
  _nin: '$nin',
  _gt: '$gt',
  _gte: '$gte',
  _lt: '$lt',
  _lte: '$lte',
```

This way the Casl instance will understand the operators as they are Mongodb Query operators.

## Important Notes

To make the Casl instance understand the operators: $and, $or, and $not you need to follow the <a href="https://casl.js.org/v6/en/advanced/customize-ability" target="_blank">instructions</a> from the Casl documentation

## Usage

### Locally installed

```bash
npx p-gen -s your-hasura-admin-secret
```

### Globally installed
```bash
p-gen -s your-hasura-admin-secret
```


## License

[MIT licensed](LICENSE).
