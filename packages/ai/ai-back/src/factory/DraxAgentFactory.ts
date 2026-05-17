import DraxAgent from "../agents/DraxAgent.js";

class DraxAgentFactory {
    private static singletons: Record<string, DraxAgent> = {};

    public static instance(identifier: string = "default", description: string = ""): DraxAgent {
        if (!DraxAgentFactory.singletons[identifier]) {
            DraxAgentFactory.singletons[identifier] = new DraxAgent(identifier, description);
        }

        return DraxAgentFactory.singletons[identifier];
    }

    public static agents(): DraxAgent[] {
        return Object.values(DraxAgentFactory.singletons);
    }
}

export default DraxAgentFactory;
export {
    DraxAgentFactory,
};
