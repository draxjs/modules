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
import HttpRestClientFactory from './factories/HttpRestClientFactory';
import HttpGqlClientFactory from './factories/HttpGqlClientFactory';
import HttpClientFactory from './factories/HttpClientFactory';
import {CommonI18nMessages} from './i18n/index';

import {formatDate} from './helpers/formatDate'
import {formatDateTime} from './helpers/formatDateTime'
import {debounce} from './helpers/debounce'

import type {IHttpClient, IHttpOptions} from './interfaces/IHttpClient';
import type {IGqlClient, IGqlOptions} from './interfaces/IGqlClient';
import type {IRestError} from './interfaces/IRestError';
import type {IGqlError} from './interfaces/IGqlError';
import type {IInputError} from './interfaces/IInputError';
import type {IClientInputError} from './interfaces/IClientInputError';



export {
  //helpers
  formatDate,
  formatDateTime,
  debounce,

  //Clients
  HttpRestClient,
  HttpGqlClient,

  HttpRestClientFactory,
  HttpGqlClientFactory,
  HttpClientFactory,

  //I18n
  CommonI18nMessages,

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
  IRestError,
  IGqlError,
  IInputError,
  IClientInputError,
}





