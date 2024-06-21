import type {IInputError} from "@/interfaces/IInputError";

interface IRestError {
  message: string;
  statusCode: number;
  body?: {
    error ?: string
    inputErrors?:  IInputError[]
  }
}

export type {IRestError}
