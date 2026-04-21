
import merge from "deepmerge";
import AILogMessages from "./AILog-i18n"
import AIMessages from "./AI-i18n"

const messages = merge.all([
    AILogMessages,
    AIMessages
])

export default messages
