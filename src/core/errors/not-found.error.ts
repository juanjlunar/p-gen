export class NotFoundError extends Error {
  code = 404;

  message = 'Invalid hasura-endpoint-url, please ensure the Hasura instance listens on the passed hasura-endpoint-url and retry. Example: http://localhost:8080/v1/metadata'
}