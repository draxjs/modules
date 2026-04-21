import merge from 'deepmerge'
import CrudSavedQueriesI18n from "./CrudSavedQueries-i18n.js";

const CrudI18nMessages = merge.all([
    CrudSavedQueriesI18n
])

export default CrudI18nMessages
export {CrudI18nMessages}
