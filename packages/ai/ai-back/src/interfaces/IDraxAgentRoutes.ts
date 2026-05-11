import type {DraxAgentControllerOptions} from "./IDraxAgentController.js";

interface DraxAgentFastifyRoutesOptions extends DraxAgentControllerOptions {
    prefix?: string;
}

export type {DraxAgentFastifyRoutesOptions};
