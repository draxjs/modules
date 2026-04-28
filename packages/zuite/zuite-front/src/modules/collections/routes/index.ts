
import CovenantCrudRoute from "./CovenantCrudRoute"
import CovenantDashboardRoute from "./CovenantRoutes"
import GroupZoneCrudRoute from "./GroupZoneCrudRoute"

export const routes = [
     ...CovenantDashboardRoute,
    ...CovenantCrudRoute,
    ...GroupZoneCrudRoute
]

export default routes
