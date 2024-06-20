import type {IInputError} from "@/interfaces/IInputError";

interface IRestError {
  message: string;
  statusCode: number;
  body?: {
    error ?: string
    inputError?:  IInputError[]
  }
}

export type {IRestError}
