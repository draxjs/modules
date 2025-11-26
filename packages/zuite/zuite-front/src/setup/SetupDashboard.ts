import {UserCrud} from "@drax/identity-vue"
import { useDashboardStore } from '@drax/dashboard-vue'

function setupDashboard(){
  const dashboardStore = useDashboardStore()
  dashboardStore.addEntity(UserCrud.instance)
  console.log("Dashboard Setup Done")
}

export default setupDashboard
