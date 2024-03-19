export class HasuraConnectionError extends Error {
  constructor(hasuraEndpointUrl: string) {
    super();

    this.message = `ECONNREFUSED, make sure the Hasura server is running at ${hasuraEndpointUrl}`;
  }
}
