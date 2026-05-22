
import AILogCrudRoute from "./AILogCrudRoute"
import AgentSessionCrudRoute from "./AgentSessionCrudRoute"
import DraxAgentRoute from "./DraxAgentRoute"
import TTSVoiceCrudRoute from "./TTSVoiceCrudRoute"

export const routes = [
    ...AILogCrudRoute,
    ...AgentSessionCrudRoute,
    ...TTSVoiceCrudRoute,
    ...DraxAgentRoute
]

export default routes
