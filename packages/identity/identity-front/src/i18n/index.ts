import merge from 'deepmerge'
import identityAuthI18n from "./identity-auth-i18n.js";
import identityValidationI18n from "./identity-validation-i18n.js";
import identityPermissionI18n from "./identity-permissions-i18n.js";
import identityUserI18n from "./identity-user-i18n.js";
import identityUserApiKyI18n from "./identity-userApiKey-i18n.js";
import identityRoleI18n from "./identity-role-i18n.js";
import identityTenantI18n from "./identity-tenant-i18n.js";
import identityAuditI18n from "./identity-audit-i18n.js";
import identityUserSessionI18n from "./identity-userSession-i18n.js";
import identityUserLoginFailI18n from "./identity-userLoginFail-i18n.js";

const IdentityI18nMessages = merge.all([
    identityAuthI18n,
    identityValidationI18n,
    identityUserI18n,
    identityRoleI18n,
    identityTenantI18n,
    identityPermissionI18n,
    identityUserApiKyI18n,
    identityAuditI18n,
    identityUserSessionI18n,
    identityUserLoginFailI18n
])

export default IdentityI18nMessages
export {IdentityI18nMessages}
