import type {IInputError} from "./IInputError";

interface IRestError {
  message: string;
  statusCode: number;
  body?: {
    statusCode?: number
    error ?: string
    message?: string
    i18nMessage?: string
    inputErrors?:  IInputError[],
  }
}

export type {IRestError}
