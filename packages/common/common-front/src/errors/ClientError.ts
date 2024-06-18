import type {IInputError} from "../interfaces/IInputError";
import type {IClientInputError} from "../interfaces/IClientInputError";

class ClientError extends Error {
  inputErrors: IClientInputError

  constructor(message: string, inputErrors?: IInputError[]) {
    super(message)
    this.name = 'ClientError'
    this.inputErrors = inputErrors ? this.convertToKeyValue(inputErrors) : {}
  }

  convertToKeyValue(input: IInputError[]) {
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
