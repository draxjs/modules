import {AuthGqlProvider, AuthRestProvider, AuthSystem, IAuthProvider} from "@drax/identity-front";
import {HttpGqlClient, HttpRestClient} from "@drax/common-front";

const REST = 'REST'
const GRAPHQL = 'GRAPHQL'
const CLIENTS = [REST, GRAPHQL]

export function authSystemFactory(HttpClient: string = REST): AuthSystem {

  if (!CLIENTS.includes(HttpClient)) {
    throw new Error(`HttpClient must be one of ${CLIENTS}`)
  }

  const baseUrl: string = ''
  let authProvider: IAuthProvider

  if (HttpClient === GRAPHQL) {
    authProvider = new AuthGqlProvider(new HttpGqlClient('/graphql'))
  }else{
    authProvider = new AuthRestProvider(new HttpRestClient(baseUrl))
  }

  const authSystem = new AuthSystem(authProvider)
  return authSystem

}
