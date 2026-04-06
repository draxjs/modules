
import PersonCrudRoute from "./PersonCrudRoute"
import CountryCrudRoute from "./CountryCrudRoute"
import LanguageCrudRoute from "./LanguageCrudRoute"

export const routes = [
    ...PersonCrudRoute,
...CountryCrudRoute,
...LanguageCrudRoute
]

export default routes
