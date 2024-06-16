import {RoleGqlProvider, RoleRestProvider, RoleSystem, IRoleProvider} from "@drax/identity-front";
import {HttpGqlClient, HttpRestClient} from "@drax/common-front";

const REST = 'REST'
const GRAPHQL = 'GRAPHQL'
const CLIENTS = [REST, GRAPHQL]

export function roleSystemFactory(HttpClient: string = REST): RoleSystem {

  if (!CLIENTS.includes(HttpClient)) {
    throw new Error(`HttpClient must be one of ${CLIENTS}`)
  }

  const baseUrl: string = ''
  let userProvider: IRoleProvider

  if (HttpClient === GRAPHQL) {
    userProvider = new RoleGqlProvider(new HttpGqlClient('/graphql'))
  }else{
    userProvider = new RoleRestProvider(new HttpRestClient(baseUrl))
  }

  const roleSystem = new RoleSystem(userProvider)
  return roleSystem

}
