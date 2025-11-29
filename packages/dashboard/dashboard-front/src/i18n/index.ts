import merge from 'deepmerge'
import DashboardI18n from "./Dashboard-i18n.js";

const DashboardI18nMessages = merge.all([
    DashboardI18n,
])

export default DashboardI18nMessages
export {DashboardI18nMessages}
