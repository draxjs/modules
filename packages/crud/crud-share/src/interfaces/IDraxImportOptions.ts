interface IDraxImportOptions {
  format: 'JSON' | 'CSV';
  content: string;
  separator?: string;
}

export type {IDraxImportOptions}
