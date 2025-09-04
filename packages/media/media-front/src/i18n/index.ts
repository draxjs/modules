import merge from 'deepmerge'

import mediaPermissionI18n from "./media-permissions-i18n.js";


const MediaI18nMessages = merge.all([
    mediaPermissionI18n
])

export default MediaI18nMessages
export {MediaI18nMessages}
