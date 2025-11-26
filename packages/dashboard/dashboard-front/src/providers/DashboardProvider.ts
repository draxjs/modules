
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IDashboard, IDashboardBase} from '@drax/dashboard-share'

class DashboardProvider extends AbstractCrudRestProvider<IDashboard, IDashboardBase, IDashboardBase> {

  static singleton: DashboardProvider

  constructor() {
   super('/api/dashboard')
  }

  static get instance() {
    if(!DashboardProvider.singleton){
      DashboardProvider.singleton = new DashboardProvider()
    }
    return DashboardProvider.singleton
  }

}

export default DashboardProvider

