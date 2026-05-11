import DraxAgentController from "../controllers/DraxAgentController.js";

async function DraxAgentRoutes(fastify, options:any) {
    const controller = new DraxAgentController();
    const prefix = "/api/ai/agent";

    fastify.post(`${prefix}/session`, (req, rep) => controller.startSession(req, rep));
    fastify.post(`${prefix}/message`, (req, rep) => controller.message(req, rep));
}

export default DraxAgentRoutes;
export {DraxAgentRoutes};
