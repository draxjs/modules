
import merge from "deepmerge";
import AILogMessages from "./AILog-i18n"

const messages = merge.all([
    AILogMessages
])

export default messages
