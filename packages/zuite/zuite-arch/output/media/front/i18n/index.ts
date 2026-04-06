
import merge from "deepmerge";
import FileMessages from "./File-i18n"

const messages = merge.all([
    FileMessages
])

export default messages
