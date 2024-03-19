export type Config = {
  transformers?: {
    action: (value: string) => string;
    subject: (value: string) => string;
  };
  replacements?: Record<string, string>;
};
