export type DraxAgentDiagnosticProvider = "openai" | "deepseek" | "google" | "ollama" | "custom" | "unknown";

export type DraxAgentDiagnosticCategory =
    "configuration" | "authentication" | "permission" | "model" | "quota" |
    "rate_limit" | "network" | "upstream" | "unknown";

export interface DraxAgentDiagnosticContext {
    agentIdentifier: string;
    agentType: "specialist" | "router";
    code: string;
    stage?: string;
    correlationId?: string;
    provider?: unknown;
    providerName?: string;
}

export interface DraxAgentDiagnostic {
    event: "drax.agent.error";
    correlationId?: string;
    agentIdentifier: string;
    agentType: "specialist" | "router";
    code: string;
    stage?: string;
    provider: DraxAgentDiagnosticProvider;
    diagnostic: {
        category: DraxAgentDiagnosticCategory;
        hint: string;
        errorName?: string;
        upstreamStatus?: number;
        upstreamCode?: string;
        upstreamParameter?: string;
        requestId?: string;
        configurationKeys?: string[];
    };
}

type Details = DraxAgentDiagnostic["diagnostic"];

const MAX_DEPTH = 8;
const MAX_MESSAGE = 4096;
const reported = new WeakMap<object, Set<string>>();
const hints: Record<DraxAgentDiagnosticCategory, string> = {
    configuration: "Check the required provider configuration keys before creating the provider.",
    authentication: "Check that the provider API key is configured, valid and active.",
    permission: "Check the provider account permissions and access to the requested resource.",
    model: "Check the configured model and its availability for this provider and account.",
    quota: "Check the provider account balance, billing and available quota.",
    rate_limit: "Check provider request and token limits; verify operation state before retrying a turn.",
    network: "Check provider connectivity, DNS, base URL and request timeout settings.",
    upstream: "Check provider availability; reconcile any side effects before retrying a turn.",
    unknown: "Inspect the original error in a trusted debugger; raw error details are intentionally omitted.",
};
const errorNames = new Set([
    "Error", "TypeError", "RangeError", "SyntaxError", "DraxAgentError", "APIError", "ApiError",
    "AuthenticationError", "PermissionDeniedError", "NotFoundError", "RateLimitError",
    "BadRequestError", "UnprocessableEntityError", "InternalServerError", "APIConnectionError",
    "APIConnectionTimeoutError", "APITimeoutError", "AxiosError", "GoogleGenerativeAIError",
    "GoogleGenerativeAIFetchError", "AbortError",
]);
const codes = new Set([
    "invalid_api_key", "authentication_error", "permission_denied", "model_not_found",
    "model_not_supported", "insufficient_quota", "insufficient_balance", "payment_required",
    "rate_limit_exceeded", "rate_limit_error", "server_error", "internal_error",
    "ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET", "EAI_AGAIN", "ERR_NETWORK",
    "UNAUTHENTICATED", "PERMISSION_DENIED", "NOT_FOUND", "RESOURCE_EXHAUSTED",
    "UNAVAILABLE", "INTERNAL", "DEADLINE_EXCEEDED", "INVALID_ARGUMENT",
]);
const parameters = new Set([
    "model", "api_key", "base_url", "response_format", "tools", "tool_choice", "messages",
    "temperature", "max_tokens", "max_completion_tokens", "stream", "input", "modalities",
]);
const providerAliases: Record<string, DraxAgentDiagnosticProvider> = {
    openai: "openai", openaiprovider: "openai",
    deepseek: "deepseek", deepseekai: "deepseek", deepseekaiprovider: "deepseek",
    google: "google", googleai: "google", googleaiprovider: "google",
    ollama: "ollama", ollamaai: "ollama", ollamaaiprovider: "ollama",
};
const configurationKeys: Record<string, Partial<Record<string, string>>> = {
    OpenAI: {apiKey: "OPENAI_API_KEY", model: "OPENAI_MODEL"},
    DeepSeek: {apiKey: "DEEPSEEK_API_KEY", model: "DEEPSEEK_MODEL", baseUrl: "DEEPSEEK_BASE_URL"},
    "Google AI": {apiKey: "GOOGLE_AI_API_KEY", model: "GOOGLE_AI_MODEL"},
    "Ollama AI": {model: "OLLAMA_AI_MODEL", baseUrl: "OLLAMA_AI_BASE_URL"},
};

function isObject(value: unknown): value is object {
    return value !== null && (typeof value === "object" || typeof value === "function");
}

// Do not invoke accessors, toJSON, inspect, coercion or SDK methods, even on the context.
// Descriptor/prototype traps on proxies can throw; each individual lookup fails closed.
function read(value: unknown, key: string): unknown {
    const visited = new Set<object>();
    for (let depth = 0; depth < MAX_DEPTH && isObject(value) && !visited.has(value); depth++) {
        visited.add(value);
        try {
            const descriptor = Object.getOwnPropertyDescriptor(value, key);
            if (descriptor) return "value" in descriptor ? descriptor.value : undefined;
            value = Object.getPrototypeOf(value);
        } catch {
            return undefined;
        }
    }
    return undefined;
}

function chain(error: unknown): object[] {
    const result: object[] = [];
    const visited = new Set<object>();
    while (isObject(error) && result.length < MAX_DEPTH && !visited.has(error)) {
        visited.add(error);
        result.push(error);
        error = read(error, "cause");
    }
    return result;
}

function identifier(value: unknown, max = 128): string | undefined {
    return typeof value === "string" && value.length <= max && /^[A-Za-z0-9]/.test(value)
        && !/[^A-Za-z0-9_.:/-]/.test(value) ? value : undefined;
}

function allowed(value: unknown, values: Set<string>): string | undefined {
    return typeof value === "string" && values.has(value) ? value : undefined;
}

function constructorName(value: unknown): unknown {
    if (!isObject(value)) return undefined;
    try {
        return read(read(Object.getPrototypeOf(value), "constructor"), "name");
    } catch {
        return undefined;
    }
}

function provider(context: DraxAgentDiagnosticContext): DraxAgentDiagnosticProvider {
    const instance = read(context, "provider");
    if (instance !== undefined) {
        if (!isObject(instance)) return "custom";
        const name = constructorName(instance);
        // Instance overrides are recognized only by the known concrete provider class names.
        switch (name) {
            case "OpenAiProvider": return "openai";
            case "DeepSeekAiProvider": return "deepseek";
            case "GoogleAiProvider": return "google";
            case "OllamaAiProvider": return "ollama";
            default: return "custom";
        }
    }
    const name = read(context, "providerName");
    if (typeof name !== "string" || !name.length) return "unknown";
    if (name.length > 64) return "custom";
    return Object.prototype.hasOwnProperty.call(providerAliases, name.toLowerCase())
        ? providerAliases[name.toLowerCase()] : "custom";
}

function status(value: unknown): number | undefined {
    return typeof value === "number" && Number.isInteger(value) && value >= 100 && value <= 599
        ? value : undefined;
}

function requestId(value: unknown, header = false): string | undefined {
    if (typeof value !== "string" || value.length > 128 || /[^A-Za-z0-9_-]/.test(value)) return undefined;
    if (/^req[_-][A-Za-z0-9][A-Za-z0-9_-]*$/.test(value)) return value;
    // Some SDKs use UUIDs for x-request-id; no other free-form header values are accepted.
    return header && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
        ? value : undefined;
}

function findRequestId(sources: unknown[]): string | undefined {
    for (const source of sources) {
        for (const key of ["request_id", "requestID", "requestId", "_request_id"]) {
            const id = requestId(read(source, key));
            if (id) return id;
        }
        const headers = read(source, "headers");
        for (const key of ["x-request-id", "X-Request-Id"]) {
            const id = requestId(read(headers, key), true);
            if (id) return id;
        }
    }
    return undefined;
}

function message(value: unknown): string | undefined {
    const text = read(value, "message");
    return typeof text === "string" && text.length <= MAX_MESSAGE ? text : undefined;
}

function missingConfiguration(text: string): string[] | undefined {
    if (/[\r\n\u2028\u2029]/.test(text)) return undefined;
    const match = /^(OpenAI|DeepSeek|Google AI|Ollama AI) (apiKey|model|baseUrl) required$/.exec(text);
    if (match) {
        const key = configurationKeys[match[1]][match[2]];
        if (key) return [key];
    }
    return /^Unsupported AI provider(?::[^\r\n]*)?$/.test(text) ? ["AI_PROVIDER"] : undefined;
}

function missingModel(text: string): boolean {
    if (/[\r\n\u2028\u2029]/.test(text)) return false;
    // Known OpenAI, Ollama and Google SDK messages. Captured model/config values never leave this function.
    return /^The model [`'"][^`'"\r\n]+[`'"] (?:does not exist|is not supported)(?: or you do not have access to it)?\.?$/.test(text)
        || /^model ["'][^"'\r\n]+["'] (?:not found|is not supported)(?:, try pulling it first)?\.?$/.test(text)
        || /^(?:\[GoogleGenerativeAI Error\]:[^\r\n]* )?models\/[^\s]+ is not found for API version [^,\s]+, or is not supported for [A-Za-z0-9_.-]+\.?$/.test(text);
}

function categoryForCode(code?: string): DraxAgentDiagnosticCategory | undefined {
    switch (code) {
        case "invalid_api_key": case "authentication_error": case "UNAUTHENTICATED": return "authentication";
        case "permission_denied": case "PERMISSION_DENIED": return "permission";
        case "model_not_found": case "model_not_supported": case "NOT_FOUND": return "model";
        case "insufficient_quota": case "insufficient_balance": case "payment_required": return "quota";
        case "rate_limit_exceeded": case "rate_limit_error": case "RESOURCE_EXHAUSTED": return "rate_limit";
        case "ECONNREFUSED": case "ENOTFOUND": case "ETIMEDOUT": case "ECONNRESET":
        case "EAI_AGAIN": case "ERR_NETWORK": case "DEADLINE_EXCEEDED": return "network";
        case "server_error": case "internal_error": case "UNAVAILABLE": case "INTERNAL": return "upstream";
        default: return undefined;
    }
}

function categoryForStatus(value?: number): DraxAgentDiagnosticCategory | undefined {
    switch (value) {
        case 401: return "authentication";
        case 403: return "permission";
        case 404: return "model";
        case 402: return "quota";
        case 429: return "rate_limit";
        default: return value !== undefined && value >= 500 ? "upstream" : undefined;
    }
}

function details(error: object): Details {
    const nested = read(error, "error");
    const response = read(error, "response");
    const responseError = read(read(response, "data"), "error");
    const sources = [nested, responseError, error];
    const name = allowed(read(error, "name"), errorNames) ?? allowed(constructorName(error), errorNames);
    const result: Details = {category: "unknown", hint: hints.unknown};
    if (name) result.errorName = name;
    // A public DraxAgentError status/code is not an upstream SDK status/code.
    const upstreamSources = name === "DraxAgentError" ? [nested, responseError] : sources;
    for (const source of [...upstreamSources, response]) {
        const value = status(read(source, "status")) ?? status(read(source, "statusCode"));
        if (value !== undefined && result.upstreamStatus === undefined) result.upstreamStatus = value;
    }
    let codeCategory: DraxAgentDiagnosticCategory | undefined;
    for (const source of upstreamSources) {
        for (const key of ["code", "type", "status"]) {
            const code = allowed(read(source, key), codes);
            if (code) {
                result.upstreamCode ??= code;
                codeCategory ??= categoryForCode(code);
            }
        }
        const parameter = allowed(read(source, "param"), parameters);
        if (parameter) result.upstreamParameter ??= parameter;
    }
    const id = findRequestId([error, response, nested, responseError]);
    if (id) result.requestId = id;
    let modelMessage = false;
    for (const source of sources) {
        const text = message(source);
        if (text === undefined) continue;
        const keys = missingConfiguration(text);
        if (keys) {
            result.category = "configuration";
            result.hint = hints.configuration;
            result.configurationKeys = keys;
            return result;
        }
        modelMessage ||= missingModel(text);
    }
    result.category = codeCategory ?? categoryForStatus(result.upstreamStatus)
        ?? (["APIConnectionError", "APIConnectionTimeoutError", "APITimeoutError"].includes(name ?? "") ? "network" : undefined)
        ?? (modelMessage ? "model" : "unknown");
    result.hint = hints[result.category];
    return result;
}

export class DraxAgentDiagnostics {
    /** Pure allowlist projection. No original error/provider objects are retained in the result. */
    static build(error: unknown, context: DraxAgentDiagnosticContext): DraxAgentDiagnostic {
        const result: DraxAgentDiagnostic = {
            event: "drax.agent.error",
            agentIdentifier: identifier(read(context, "agentIdentifier")) ?? "unknown",
            agentType: read(context, "agentType") === "router" ? "router" : "specialist",
            code: identifier(read(context, "code"), 96) ?? "unknown",
            provider: provider(context),
            diagnostic: {category: "unknown", hint: hints.unknown},
        };
        const correlationId = identifier(read(context, "correlationId"));
        const stage = identifier(read(context, "stage"), 64);
        if (correlationId) result.correlationId = correlationId;
        if (stage) result.stage = stage;
        // Prefer the underlying failure over the public wrapper, within a bounded cause chain.
        for (const item of chain(error).reverse()) {
            const candidate = details(item);
            if (result.diagnostic.category === "unknown") {
                if (candidate.category !== "unknown" || Object.keys(result.diagnostic).length === 2) {
                    result.diagnostic = candidate;
                }
            }
        }
        return result;
    }

    /** Best effort only: diagnostics must never change the caller's error/HTTP control flow. */
    static report(error: unknown, context: DraxAgentDiagnosticContext): void {
        try {
            const diagnostic = DraxAgentDiagnostics.build(error, context);
            if (diagnostic.correlationId) {
                const objects = chain(error);
                const duplicate = objects.some(item => reported.get(item)?.has(diagnostic.correlationId!) === true);
                for (const item of objects) {
                    let correlations = reported.get(item);
                    if (!correlations) {
                        correlations = new Set<string>();
                        reported.set(item, correlations);
                    }
                    correlations.add(diagnostic.correlationId);
                }
                if (duplicate) return;
            }
            console.error("[drax-agent] error", diagnostic);
        } catch {
            // Includes hostile proxies and logger failures. Never replace the original failure.
        }
    }
}
