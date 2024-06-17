import type {IInputError} from "../interfaces/IInputError";
import type {IClientInputError} from "../interfaces/IClientInputError";

class ClientError extends Error {
  inputErrors: IClientInputError

  constructor(message: string, inputErrors: IInputError[]) {
    super(message)
    this.name = 'ClientError'
    this.inputErrors = this.convertToKeyValue(inputErrors)
  }

  convertToKeyValue(input: IInputError[]) {
    return input.reduce((acc:IClientInputError, { field, reason }) => {
      if (!acc[field]) {
        acc[field] = reason;
      } else {
        acc[field] += `, ${reason}`;
      }
      return acc;
    }, {});
  }

  consoleError() {
    console.error(`ClientError - message: ${this.message} inputErrors: ${this.inputErrors}`)
  }

}

export default ClientError
