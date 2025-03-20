import type {IRestError} from "../../interfaces/IRestError";
import HttpError from "./HttpError";

class HttpStatusError extends HttpError implements IRestError{
  public statusCode: number;
  public body: any;

  constructor(statusCode: number, body: any) {
    const message = `Status code error: ${statusCode}`
    super(message)
    this.name = 'HttpClientStatusError'
    this.statusCode = statusCode
    this.body = body
    this.consoleError()
  }

  consoleError() {
    console.error(`HttpClientStatusError - statusCode: ${this.statusCode} message: ${this.message} body: ${JSON.stringify(this.body)}`)
  }

}

export default HttpStatusError
