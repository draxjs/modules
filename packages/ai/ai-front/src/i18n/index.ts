
import merge from "deepmerge";
import AILogMessages from "./AILog-i18n"
import AIMessages from "./AI-i18n"
import AgentSession from "./AgentSession-i18n"

const messages = merge.all([
    AILogMessages,
    AIMessages,
    AgentSession
])

export default messages
