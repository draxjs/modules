
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ICovenant, ICovenantBase} from '../interfaces/ICovenant'

class CovenantProvider extends AbstractCrudRestProvider<ICovenant, ICovenantBase, ICovenantBase> {
    
  static singleton: CovenantProvider
    
  constructor() {
   super('/api/covenants')
  }
  
  static get instance() {
    if(!CovenantProvider.singleton){
      CovenantProvider.singleton = new CovenantProvider()
    }
    return CovenantProvider.singleton
  }

  async exportExcel(date: string, group: string): Promise<Response> {
    const authStoreString = localStorage.getItem('AuthStore')
    let accessToken: string | null = null

    if (authStoreString) {
      const authStoreObject = JSON.parse(authStoreString)
      accessToken = authStoreObject.accessToken ?? null
    }

    const query = new URLSearchParams({date, group})

    return fetch(`${this.basePath}/export-excel?${query.toString()}`, {
      method: 'GET',
      headers: accessToken ? {Authorization: `Bearer ${accessToken}`} : undefined,
    })
  }

}

export default CovenantProvider
