import type {IInputError} from "./IInputError";

interface IRestError {
  message: string;
  statusCode: number;
  body?: {
    error ?: string
    inputErrors?:  IInputError[]
  }
}

export type {IRestError}
