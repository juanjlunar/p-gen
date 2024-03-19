import { DEFAULT_HASURA_ENDPOINT_URL } from '../../hasura/constants';

export class NotFoundError extends Error {
  code = 404;

  message = `Invalid hasura-endpoint-url, please ensure the Hasura instance listens on the passed hasura-endpoint-url and retry. Example: ${DEFAULT_HASURA_ENDPOINT_URL}`;
}
