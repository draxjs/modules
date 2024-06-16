import type {IGqlClient, IGqlOptions} from "../interfaces/IGqlClient";
import type {IHttpHeader} from "@/core/interfaces/IHttpClient";
import HttpStatusError from "../errors/http/HttpStatusError";
import HttpTimeoutError from "../errors/http/HttpTimeoutError";
import HttpNetworkError from "../errors/http/HttpNetworkError";
import HttpError from "../errors/http/HttpError";
import GqlError from "../errors/gql/GqlError";
import GqlMultiError from "../errors/gql/GqlMultiError";
import type {IGqlError} from "@/core/interfaces/IGqlError";

class HttpGqlClient implements IGqlClient {

  url: string;
  baseHeaders: IHttpHeader;
  private signal: AbortSignal;
  private controller: AbortController;
  private timeout: number;

  constructor(url: string = '/graphql', baseHeaders: IHttpHeader = {'content-type': 'application/json'}, timeout: number = 10000) {
    this.url = url;
    this.baseHeaders = baseHeaders;
    this.controller = new AbortController();
    this.signal = this.controller.signal;
    this.timeout = timeout;
  }

  addHeader(name: string, value: string): void {
    this.baseHeaders[name] = value;
  }

  removeHeader(name: string): void {
    delete this.baseHeaders[name];
  }

  errorHandler(error: Error): Error {

    if (error instanceof GqlError || error instanceof GqlMultiError) {
      return error
    } else if (error instanceof HttpStatusError) {
      return error
    } else if (error.name === 'AbortError') {
      return new HttpTimeoutError()
    } else if (error.name === 'TypeError') {
      return new HttpNetworkError()
    } else {
      const message: string = error.message;
      const statusCode: number = 0
      const body: string | undefined = error.stack
      return new HttpError(message, statusCode, body);
    }
  }

  async exec( query: string, variables: object, options: IGqlOptions): Promise<object> {
    try {
      const url = this.url;
      const headers: IHttpHeader = {...this.baseHeaders, ...options?.headers};
      const data = {query, variables}
      const timeoutId = setTimeout(() => this.controller.abort(), this.timeout)
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
        signal: this.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const body: string = await response.json();
        throw new HttpStatusError(response.status, body);
      }

      const result = await response.json();

      if (result.errors) {
        const gqlErrors: Array<IGqlError> = result.errors
        if (result.errors.length === 1) {
          throw new GqlError(gqlErrors[0])
        } else if (result.errors.length > 1) {
          throw new GqlMultiError(gqlErrors.map(e => new GqlError(e)))
        }
      }
      return result.data
    } catch (error) {
      throw this.errorHandler(error as Error)
    }
  }


  async query( query: string, variables: object, options: IGqlOptions): Promise<object> {
    return this.exec( query, variables, options)
  }

  async mutation( query: string, variables: object, options: IGqlOptions): Promise<object> {
    return this.exec( query, variables, options)
  }


}

export default HttpGqlClient
