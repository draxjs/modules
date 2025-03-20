import type {IRestError} from "../../interfaces/IRestError";

class HttpError extends Error implements IRestError{
  public statusCode: number;
  public body: any;

  constructor(message: string, statusCode: number = 0, body: any = '') {
    super(message)
    this.name = 'HttpClientError'
    this.statusCode = statusCode
    this.body = body
  }

  consoleError() {
    console.error(`HttpError - statusCode: ${this.statusCode} message: ${this.message} body: ${this.body}`)
  }

}

export default HttpError
