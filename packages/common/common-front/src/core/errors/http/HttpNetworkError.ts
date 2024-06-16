import type {IHttpError} from "../../interfaces/IHttpError";
import HttpError from "./HttpError";

class HttpNetworkError extends HttpError implements IHttpError{
  public statusCode: number;
  public body: any;

  constructor() {
    const message = 'Network error'
    super(message)
    this.name = 'HttpClientNetworkError'
    this.statusCode = 0
    this.body = ''
    this.consoleError()
  }

  consoleError() {
    console.error(`HttpClientNetworkError - statusCode: ${this.statusCode} message: ${this.message} body: ${this.body}`)
  }

}

export default HttpNetworkError
