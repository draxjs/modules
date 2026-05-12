
import AILogCrudRoute from "./AILogCrudRoute"
import AgentSessionCrudRoute from "./AgentSessionCrudRoute"
import DraxAgentRoute from "./DraxAgentRoute"

export const routes = [
    ...AILogCrudRoute,
    ...AgentSessionCrudRoute,
    ...DraxAgentRoute
]

export default routes
