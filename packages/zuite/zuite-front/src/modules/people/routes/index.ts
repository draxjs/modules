
import PersonCrudRoute from "./PersonCrudRoute"
import PersonDashboardRoute from "./PersonDashboardRoute"
import CountryCrudRoute from "./CountryCrudRoute"
import LanguageCrudRoute from "./LanguageCrudRoute"

export const routes = [
  ...PersonCrudRoute,
  ...PersonDashboardRoute,
  ...CountryCrudRoute,
  ...LanguageCrudRoute
]

export default routes
