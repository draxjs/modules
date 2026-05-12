
import AgentSessionCrudPage from "../pages/crud/AgentSessionCrudPage.vue";


const AgentSessionCrudRoute = [
  {
    name: 'AgentSessionCrudPage',
    path: '/crud/agentsession',
    component: AgentSessionCrudPage,
    meta: {
      auth: true,
      permission: 'agentsession:manage',
    }
  },
]

export default AgentSessionCrudRoute
export { AgentSessionCrudRoute }
