import HttpGqlClient from './clients/HttpGqlClient';
import HttpRestClient from './clients/HttpRestClient';
import HttpError from './errors/http/HttpError';
import HttpStatusError from './errors/http/HttpStatusError';
import HttpTimeoutError from './errors/http/HttpTimeoutError';
import HttpNetworkError from './errors/http/HttpNetworkError';
import UnknownError from './errors/UnknownError';
import ServerError from './errors/ServerError';
import ClientError from './errors/ClientError';
import NetworkError from './errors/NetworkError';
import HttpFetchClientFactory from './factories/HttpFetchClientFactory';
import HttpGqlClientFactory from './factories/HttpGqlClientFactory';

import type {IHttpClient, IHttpOptions} from './interfaces/IHttpClient';
import type {IGqlClient, IGqlOptions} from './interfaces/IGqlClient';
import type {IHttpError} from './interfaces/IHttpError';
import type {IInputError} from './interfaces/IInputError';
import type {IClientInputError} from './interfaces/IClientInputError';
import type {IPaginateClient} from './interfaces/IPaginateClient';



export {
  //Clients
  HttpRestClient,
  HttpGqlClient,

  HttpFetchClientFactory,
  HttpGqlClientFactory,

  //Errors
  HttpError,
  HttpStatusError,
  HttpTimeoutError,
  HttpNetworkError,
  ServerError,
  ClientError,
  NetworkError,
  UnknownError,

}

export type {
  IHttpClient,
  IHttpOptions,
  IGqlClient,
  IGqlOptions,
  IHttpError,
  IInputError,
  IClientInputError,
  IPaginateClient
}





