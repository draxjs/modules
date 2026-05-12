
import merge from "deepmerge";
import AILogMessages from "./AILog-i18n"
import AgentSessionMessages from "./AgentSession-i18n"

const messages = merge.all([
    AILogMessages,
    AgentSessionMessages
])

export default messages
