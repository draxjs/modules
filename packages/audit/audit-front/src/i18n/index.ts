import merge from 'deepmerge'
import AuditI18n from "./Audit-i18n.js";

const AuditI18nMessages = merge.all([
    AuditI18n,
])

export default AuditI18nMessages
export {AuditI18nMessages}
