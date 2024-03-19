export class UnauthorizedError extends Error {
  code = 401;

  message =
    'Hasura Authorization failed, please ensure the hasura-admin-secret variable is valid and try again.';
}
