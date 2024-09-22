import {PersonCrudRoute} from "./PersonCrudRoute"
import {CountryCrudRoute} from "./CountryCrudRoute"
import {LanguageCrudRoute} from "./LanguageCrudRoute"


export default [
  ...PersonCrudRoute, ...CountryCrudRoute, ...LanguageCrudRoute
]
