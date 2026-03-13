
import merge from "deepmerge";
import FileMessages from "./File-i18n"
import MediaPermissionsMessages from "./media-permissions-i18n"

const messages = merge.all([
    FileMessages,
    MediaPermissionsMessages
])

export default messages
