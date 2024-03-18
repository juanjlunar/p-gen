export type GenerateCaslPermissionsDto = {
  args: {
    hasuraAdminSecret: string;
    hasuraEndpointUrl: string;
  },
  options: Record<string, unknown>;
}