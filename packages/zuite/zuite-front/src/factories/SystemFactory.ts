import {
  UserGqlProvider, UserRestProvider, UserSystem,
  TenantGqlProvider, TenantRestProvider, TenantSystem,
  AuthGqlProvider, AuthRestProvider, AuthSystem,
  RoleGqlProvider, RoleRestProvider, RoleSystem,
  UserApiKeyGqlProvider, UserApiKeyRestProvider, UserApiKeySystem
} from "@drax/identity-front";

import type { IRoleProvider, IUserProvider, ITenantProvider, IAuthProvider, IUserApiKeyProvider} from "@drax/identity-front";
import {HttpGqlClientFactory, HttpRestClientFactory} from "@drax/common-front";


const REST = 'REST'
const GRAPHQL = 'GRAPHQL'
const CLIENTS = [REST, GRAPHQL]

export function SystemFactory(HttpClientType: string = REST) {

  if (!CLIENTS.includes(HttpClientType)) {
    throw new Error(`HttpClient must be one of ${CLIENTS}`)
  }

  const baseUrl: string = ''
  let userProvider: IUserProvider
  let roleProvider: IRoleProvider
  let authProvider: IAuthProvider
  let tenantProvider: ITenantProvider
  let userApiKeyProvider: IUserApiKeyProvider
  let HttpClient



  if (HttpClientType === GRAPHQL) {
    HttpClient = HttpGqlClientFactory.getInstance('/graphql')
    userProvider = new UserGqlProvider(HttpClient)
    roleProvider = new RoleGqlProvider(HttpClient)
    authProvider = new AuthGqlProvider(HttpClient)
    tenantProvider = new TenantGqlProvider(HttpClient)
    userApiKeyProvider = new UserApiKeyGqlProvider(HttpClient)
  } else {
    HttpClient = HttpRestClientFactory.getInstance(baseUrl)
    userProvider = new UserRestProvider(HttpClient)
    roleProvider = new RoleRestProvider(HttpClient)
    authProvider = new AuthRestProvider(HttpClient)
    tenantProvider = new TenantRestProvider(HttpClient)
    userApiKeyProvider = new UserApiKeyRestProvider(HttpClient)
  }

  //AccessToken on start directly from local storage
  let accessToken:string|null = null
  const authStoreString = localStorage.getItem("AuthStore");
  if (authStoreString) {
    const authStoreObject = JSON.parse(authStoreString);
    accessToken = authStoreObject.accessToken;
    if(accessToken){
      HttpClient.addHeader('Authorization', `Bearer ${accessToken}`)
    }
  }

  const userSystem = new UserSystem(userProvider)
  const roleSystem = new RoleSystem(roleProvider)
  const authSystem = new AuthSystem(authProvider)
  const tenantSystem = new TenantSystem(tenantProvider)
  const userApiKeySystem = new UserApiKeySystem(userApiKeyProvider)
  return {userSystem, roleSystem, authSystem, tenantSystem, userApiKeySystem, HttpClient}

}
