import type {DraxAgentKind, DraxAgentRoutingConfig} from "./IDraxAgent.js";

interface DraxAgentControllerOptions {
    permission?: string | false;
    agentIdentifier?: string;
    agentDescription?: string;
}

interface DraxAgentCatalogEntry {
    identifier: string;
    description: string;
    type?: DraxAgentKind;
    routing?: DraxAgentRoutingConfig;
}

interface DraxAgentCatalogResponse {
    agents: DraxAgentCatalogEntry[];
    recommendedAgentIdentifier?: string;
}

export type {DraxAgentControllerOptions, DraxAgentCatalogEntry, DraxAgentCatalogResponse};
