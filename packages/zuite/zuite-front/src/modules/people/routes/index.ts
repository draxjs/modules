import CountryCrudRoute from "./CountryCrudRoute"
import LanguageCrudRoute from "./LanguageCrudRoute"
import PersonCrudRoute from "./PersonCrudRoute"
import merge from 'deepmerge'

const messages =  merge.all([CountryCrudRoute,LanguageCrudRoute,PersonCrudRoute])

export default messages
