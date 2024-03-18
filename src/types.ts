export type CLIOptions = {
  configPath: string;
  source: string;
}

export type Config = {
  transformers?: {
    action: (value: string) => string;
    subject: (value: string) => string;
  };
  replacements?: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObject = Record<string, any>;