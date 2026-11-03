import type {IAIProvider} from "./IAIProvider.js";
import type {DraxAgentConfig} from "./IDraxAgent.js";

interface DraxAgentRouterConfig extends DraxAgentConfig {
    /** Separate from the delegated specialist's provider/model. */
    routingProvider?: IAIProvider;
    routingModel?: string;
    /** Optional registry allowlist, further restricted by eligibility and access. */
    candidateIdentifiers?: string[];
    routingHistoryLimit?: number;
    specialistHistoryLimit?: number;
}

interface DraxAgentCatalogEntry {
    identifier: string;
    description: string;
    capabilities: string;
    examples?: string[];
}

export type {DraxAgentRouterConfig, DraxAgentCatalogEntry};
