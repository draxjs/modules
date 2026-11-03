import DraxAgent from "../agents/DraxAgent.js";
import DraxAgentRouter from "../agents/DraxAgentRouter.js";
import type {DraxAgentRouterConfig} from "../interfaces/IDraxAgentRouter.js";

class DraxAgentFactory {
    private static singletons = new Map<string, DraxAgent>();

    /** Legacy get-or-create. Use lookup for request/model-controlled identifiers. */
    public static instance(identifier: string = "default", description: string = ""): DraxAgent {
        const existing = DraxAgentFactory.lookup(identifier);
        return existing ?? DraxAgentFactory.register(new DraxAgent(identifier, description));
    }

    public static lookup(identifier: string): DraxAgent | undefined {
        return DraxAgentFactory.singletons.get(identifier);
    }

    /** Explicit registration never replaces an existing singleton, even with the same type. */
    public static register<T extends DraxAgent>(agent: T): T {
        if (!agent.identifier.trim()) {
            throw new Error("An agent identifier cannot be empty");
        }
        const existing = DraxAgentFactory.lookup(agent.identifier);
        if (existing && existing !== agent) {
            throw new Error(`Agent identifier already registered: ${agent.identifier} (${existing.type})`);
        }
        DraxAgentFactory.singletons.set(agent.identifier, agent);
        return agent;
    }

    /** Startup-only helper: refuses a specialist/router collision instead of retyping an instance. */
    public static router(identifier: string, description: string = "", config: DraxAgentRouterConfig = {}): DraxAgentRouter {
        const existing = DraxAgentFactory.lookup(identifier);
        if (existing) {
            if (!(existing instanceof DraxAgentRouter) || (description && description !== existing.description)) {
                throw new Error(`Agent identifier/type collision: ${identifier}`);
            }
            return existing.configure(config);
        }
        return DraxAgentFactory.register(new DraxAgentRouter(identifier, description).configure(config));
    }

    public static agents(): DraxAgent[] {
        return [...DraxAgentFactory.singletons.values()];
    }
}

export default DraxAgentFactory;
export {DraxAgentFactory};
