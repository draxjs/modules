import merge from 'deepmerge'
import identityValidationI18n from "./identity-validation-i18n.js";
import identityUserI18n from "./identity-user-i18n.js";

const IdentityI18nMessages = merge.all([identityValidationI18n, identityUserI18n])

export default IdentityI18nMessages
export {IdentityI18nMessages}
