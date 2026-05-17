import DraxAgentController from "../controllers/DraxAgentController.js";

async function DraxAgentRoutes(fastify, options:any) {
    const controller = new DraxAgentController(options);
    const prefix = "/api/ai/agent";

    fastify.get(`${prefix}`, (req, rep) => controller.agents(req, rep));
    fastify.post(`${prefix}/session`, (req, rep) => controller.startSession(req, rep));
    fastify.post(`${prefix}/message`, (req, rep) => controller.message(req, rep));
}

export default DraxAgentRoutes;
export {DraxAgentRoutes};
