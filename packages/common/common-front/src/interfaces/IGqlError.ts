interface IGqlError {
  message: string;
  path: Array<string>;
  extensions?: any
  isBadUserInput: boolean
}

export type {IGqlError}
