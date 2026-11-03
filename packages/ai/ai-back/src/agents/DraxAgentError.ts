interface DraxAgentErrorOptions {
    code: string;
    /** Safe public message; never include provider responses or persistence details. */
    message: string;
    statusCode: number;
    correlationId?: string;
    /** Only disclose after successful session ownership/scope resolution. */
    sessionId?: string;
    stage?: string;
    operationMayHaveCompleted?: boolean;
}

class DraxAgentError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly correlationId?: string;
    readonly sessionId?: string;
    readonly stage?: string;
    readonly operationMayHaveCompleted?: boolean;

    constructor(options: DraxAgentErrorOptions) {
        super(options.message);
        this.name = "DraxAgentError";
        this.code = options.code;
        this.statusCode = options.statusCode;
        this.correlationId = options.correlationId;
        this.sessionId = options.sessionId;
        this.stage = options.stage;
        this.operationMayHaveCompleted = options.operationMayHaveCompleted;
    }
}

export default DraxAgentError;
export {DraxAgentError};
export type {DraxAgentErrorOptions};
