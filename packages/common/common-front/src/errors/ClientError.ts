import type {IInputError} from "../interfaces/IInputError";
import type {IClientInputError} from "../interfaces/IClientInputError";
import type {IGqlError} from "../interfaces/IGqlError";
import type {IRestError} from "../interfaces/IRestError";


class ClientError extends Error {
  inputErrors: IClientInputError|undefined
  error: IRestError|IGqlError;

  constructor(error: IRestError|IGqlError) {
    let inputErrors = ClientError.extractInputErrors(error)
    let message = ClientError.extractErrorMessage(error)
    super(message)
    this.name = 'ClientError'
    this.inputErrors = inputErrors
    this.error = error
  }

  static extractErrorMessage(error: IRestError|IGqlError): string {
    if ('body' in error && error.body && error.body.inputErrors) {
      return 'error.validation'
    }

    if ('body' in error && error.body && error.body.error) {
      return error.body.error
    }

    if ('message' in error && error.message ) {
      return error.message
    }

    return 'error.client'
  }

  static extractInputErrors(error: IRestError|IGqlError): IClientInputError|undefined {
    if ('body' in error && error.body && error.body.inputErrors) {

      return ClientError.convertToKeyValue(error.body.inputErrors)
    }
    if ('extensions' in error && error.extensions && error.extensions.inputErrors) { // Corrected property name to inputError
      return ClientError.convertToKeyValue(error.extensions.inputErrors) // Corrected property name to inputError
    }

    return undefined
  }

  static convertToKeyValue(input: IInputError[]) {
    if (Array.isArray(input) && input.length > 0) {
      return input.reduce((acc: IClientInputError, {field, reason}) => {
        if (!acc[field]) {
          acc[field] = [reason];
        } else {
          acc[field].push(reason);
        }
        return acc;
      }, {});
    }else{
      return {}
    }
  }


  consoleError() {
    console.error(`ClientError - message: ${this.message} inputErrors: ${this.inputErrors}`)
  }

}

export default ClientError
