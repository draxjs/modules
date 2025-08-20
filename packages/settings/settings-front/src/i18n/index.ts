import merge from 'deepmerge'

import settingI18n from "./setting-i18n";
import settingPermissionI18n from "./setting-permissions-i18n";

const SettingI18nMessages = merge.all([
    settingI18n,
    settingPermissionI18n,
])

export default SettingI18nMessages
export {SettingI18nMessages}
