import type {IInputError} from "@/interfaces/IInputError";

interface IGqlError {
  message: string;
  path: Array<string>;
  extensions?: {
    code?: string;
    inputErrors?:  IInputError[]
  }
  isBadUserInput: boolean
}

export type {IGqlError}
