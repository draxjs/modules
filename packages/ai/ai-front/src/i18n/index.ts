
import merge from "deepmerge";
import AILogMessages from "./AILog-i18n"
import AIMessages from "./AI-i18n"
import AgentSession from "./AgentSession-i18n"
import TTSVoiceMessages from "./TTSVoice-i18n"

const messages = merge.all([
    AILogMessages,
    AIMessages,
    AgentSession,
    TTSVoiceMessages
])

export default messages
