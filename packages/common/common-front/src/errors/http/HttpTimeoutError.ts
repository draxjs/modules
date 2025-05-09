import type {IRestError} from "../../interfaces/IRestError";
import HttpError from "./HttpError";

class HttpTimeoutError extends HttpError implements IRestError {
  public statusCode: number;
  public body: any;

  constructor() {
    const message = 'Timeout error'
    super(message)
    this.name = 'HttpClientTimeoutError'
    this.statusCode = 0
    this.body = ''
    this.consoleError()
  }

  consoleError() {
    console.error(`HttpClientTimeoutError - statusCode: ${this.statusCode} message: ${this.message}`)
  }

}

export default HttpTimeoutError
