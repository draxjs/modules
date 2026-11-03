import {inspect} from "node:util";
import {afterEach, describe, expect, test, vi} from "vitest";
import {DraxAgentDiagnostics} from "../src/agents/DraxAgentDiagnostics.js";
import type {DraxAgentDiagnosticContext} from "../src/agents/DraxAgentDiagnostics.js";

const context: DraxAgentDiagnosticContext = {
    agentIdentifier: "support-agent",
    agentType: "specialist",
    code: "AGENT_PROVIDER_FAILED",
    stage: "prompt",
    correlationId: "turn-001",
    providerName: "OpenAi",
};

function wrap(cause: unknown): Error & {cause: unknown} {
    return Object.assign(new Error("Public safe error"), {
        name: "DraxAgentError", code: "AGENT_PROVIDER_FAILED", statusCode: 500, cause,
    });
}

function log() {
    return vi.spyOn(console, "error").mockImplementation(() => undefined);
}

function build(error: unknown, overrides: Partial<DraxAgentDiagnosticContext> = {}) {
    return DraxAgentDiagnostics.build(error, {...context, ...overrides});
}

afterEach(() => vi.restoreAllMocks());

describe("DraxAgentDiagnostics classification", () => {
    test("emits the agreed backend event without changing the original failure", () => {
        const logger = log();
        const root = Object.assign(new Error("Sensitive authentication failure"), {
            name: "AuthenticationError", status: 401,
            error: {code: "invalid_api_key", param: "api_key", message: "Secret upstream body"},
            request_id: "req_backend-123",
        });
        Object.freeze(root.error);
        Object.freeze(root);
        const error = Object.freeze(wrap(root));
        const before = Object.getOwnPropertyDescriptors(error);
        const original = Object.getOwnPropertyDescriptors(root);

        DraxAgentDiagnostics.report(error, context);

        expect(logger).toHaveBeenCalledExactlyOnceWith("[drax-agent] error", {
            event: "drax.agent.error", correlationId: "turn-001", agentIdentifier: "support-agent",
            agentType: "specialist", code: "AGENT_PROVIDER_FAILED", stage: "prompt", provider: "openai",
            diagnostic: {
                category: "authentication",
                hint: "Check that the provider API key is configured, valid and active.",
                errorName: "AuthenticationError", upstreamStatus: 401, upstreamCode: "invalid_api_key",
                upstreamParameter: "api_key", requestId: "req_backend-123",
            },
        });
        expect(Object.getOwnPropertyDescriptors(error)).toEqual(before);
        expect(Object.getOwnPropertyDescriptors(root)).toEqual(original);
        expect(error.cause).toBe(root);
    });

    test.each([
        [401, "authentication"], [403, "permission"], [404, "model"], [402, "quota"],
        [429, "rate_limit"], [500, "upstream"], [502, "upstream"], [599, "upstream"],
    ])("classifies numeric upstream status %s as %s", (status, category) => {
        const diagnostic = build({status}).diagnostic;
        expect(diagnostic).toMatchObject({category, upstreamStatus: status});
        expect(diagnostic.hint.length).toBeGreaterThan(20);
        expect(build({statusCode: status}).diagnostic).toEqual(diagnostic);
    });

    test.each([
        ["invalid_api_key", "authentication"], ["authentication_error", "authentication"],
        ["permission_denied", "permission"], ["model_not_found", "model"], ["model_not_supported", "model"],
        ["insufficient_quota", "quota"], ["insufficient_balance", "quota"], ["payment_required", "quota"],
        ["rate_limit_exceeded", "rate_limit"], ["rate_limit_error", "rate_limit"],
        ["ECONNREFUSED", "network"], ["ENOTFOUND", "network"], ["ETIMEDOUT", "network"],
        ["ECONNRESET", "network"], ["EAI_AGAIN", "network"], ["ERR_NETWORK", "network"],
        ["server_error", "upstream"], ["internal_error", "upstream"],
        ["UNAUTHENTICATED", "authentication"], ["PERMISSION_DENIED", "permission"],
        ["NOT_FOUND", "model"], ["RESOURCE_EXHAUSTED", "rate_limit"],
        ["UNAVAILABLE", "upstream"], ["INTERNAL", "upstream"], ["DEADLINE_EXCEEDED", "network"],
    ])("classifies known SDK code/type %s as %s", (code, category) => {
        expect(build({code}).diagnostic).toMatchObject({category, upstreamCode: code});
        expect(build({error: {type: code}}).diagnostic).toMatchObject({category, upstreamCode: code});
    });

    test("reads Google and Axios standard nested fields, not arbitrary response payloads", () => {
        expect(build({error: {status: "PERMISSION_DENIED", code: 403}}).diagnostic)
            .toMatchObject({category: "permission", upstreamCode: "PERMISSION_DENIED"});
        expect(build({
            name: "AxiosError", response: {status: 429, data: {error: {code: "insufficient_quota", param: "model"}}},
        }).diagnostic).toMatchObject({
            errorName: "AxiosError", category: "quota", upstreamStatus: 429,
            upstreamCode: "insufficient_quota", upstreamParameter: "model",
        });
        expect(build({response: {status: 400, data: {message: "OpenAI apiKey required", model: "secret"}}})
            .diagnostic.category).toBe("unknown");
    });

    test.each(["APIConnectionError", "APIConnectionTimeoutError", "APITimeoutError"])(
        "classifies network SDK name %s without reading its message", name => {
            expect(build({name, message: "private host and URL"}).diagnostic)
                .toMatchObject({category: "network", errorName: name});
        },
    );

    test.each([
        ["OpenAI apiKey required", "OPENAI_API_KEY"], ["OpenAI model required", "OPENAI_MODEL"],
        ["DeepSeek apiKey required", "DEEPSEEK_API_KEY"], ["DeepSeek model required", "DEEPSEEK_MODEL"],
        ["DeepSeek baseUrl required", "DEEPSEEK_BASE_URL"],
        ["Google AI apiKey required", "GOOGLE_AI_API_KEY"], ["Google AI model required", "GOOGLE_AI_MODEL"],
        ["Ollama AI baseUrl required", "OLLAMA_AI_BASE_URL"], ["Ollama AI model required", "OLLAMA_AI_MODEL"],
        ["Unsupported AI provider: SECRET_CONFIGURATION_VALUE", "AI_PROVIDER"],
    ])("classifies exact constructor/factory message case %#", (message, key) => {
        const diagnostic = build(wrap(new Error(message))).diagnostic;
        expect(diagnostic).toMatchObject({category: "configuration", configurationKeys: [key]});
        expect(JSON.stringify(diagnostic)).not.toContain(message);
    });

    test.each([
        'The model `SECRET_MODEL` does not exist or you do not have access to it.',
        'The model "SECRET_MODEL" is not supported.',
        "model 'SECRET_MODEL' not found, try pulling it first",
        'model "SECRET_MODEL" not found',
        "models/SECRET_MODEL is not found for API version v1beta, or is not supported for generateContent.",
        "[GoogleGenerativeAI Error]: Error fetching from https://private.test: models/SECRET_MODEL is not found for API version v1beta, or is not supported for generateContent.",
    ])("classifies known model message without emitting the model, case %#", message => {
        const diagnostic = build({status: 400, error: {message}}).diagnostic;
        expect(diagnostic).toMatchObject({category: "model", upstreamStatus: 400});
        expect(JSON.stringify(diagnostic)).not.toContain("SECRET_MODEL");
    });

    test.each([
        "apiKey required", "MyProvider apiKey required", "OpenAI baseUrl required", "OpenAI apiKey required SECRET",
        "prefix OpenAI model required", "OpenAI apiKey required\n", "OpenAI model required\u2028",
        "invalid_api_key SECRET", "401 unauthorized secret", "rate limit exceeded secret",
        "some prompt says model not found", "Error containing insufficient_quota secret", "x".repeat(5000),
    ])("does not classify arbitrary free text, case %#", message => {
        expect(build(new Error(message)).diagnostic.category).toBe("unknown");
    });

    test("uses deepest actionable cause and does not interpret a public wrapper's HTTP status as upstream", () => {
        expect(build(wrap({status: 401})).diagnostic).toMatchObject({category: "authentication", upstreamStatus: 401});
        expect(build(wrap(new Error("private"))).diagnostic).not.toHaveProperty("upstreamStatus");
        expect(build(wrap(new Error("private"))).diagnostic.category).toBe("unknown");
        expect(build({status: 503, cause: {code: "ENOTFOUND"}}).diagnostic.category).toBe("network");
    });

    test.each([undefined, null, "private thrown string", 123, true, Symbol("private"), 1n])(
        "handles non-object thrown values: %s", error => {
            expect(build(error).diagnostic).toEqual({
                category: "unknown",
                hint: "Inspect the original error in a trusted debugger; raw error details are intentionally omitted.",
            });
        },
    );
});

describe("DraxAgentDiagnostics allowlists and privacy", () => {
    test("never serializes errors, providers, payloads, stack, causes or custom hooks", () => {
        const logger = log();
        const hook = vi.fn(() => { throw new Error("HOSTILE_HOOK_SECRET"); });
        const nested = {
            code: "invalid_api_key", type: "NESTED_TYPE_SECRET", param: "NESTED_PARAM_SECRET",
            message: "NESTED_MESSAGE_SECRET sk-password Bearer token-secret prompt-secret",
            output: "OUTPUT_SECRET", tool_arguments: {password: "TOOL_SECRET"}, toJSON: hook,
        };
        const error = Object.assign(new Error("MESSAGE_SECRET sk-password prompt-secret"), {
            name: "RAW_NAME_SECRET", code: "RAW_CODE_SECRET", status: 401, error: nested,
            stack: "STACK_SECRET", request: {url: "https://private.test?api_key=URL_SECRET"},
            response: {
                status: 401, headers: {authorization: "Bearer AUTH_SECRET", "set-cookie": "COOKIE_SECRET"},
                data: {prompt: "BODY_SECRET", history: "HISTORY_SECRET", output: "RESPONSE_OUTPUT_SECRET"},
            },
            headers: {authorization: "Bearer HEADER_SECRET", "x-request-id": "PRIVATE_HEADER_SECRET"},
            cause: {message: "CAUSE_SECRET", toJSON: hook, [inspect.custom]: hook},
            toJSON: hook, [inspect.custom]: hook,
        });
        Object.defineProperty(error, "apiKey", {get: hook});
        const instance = {
            apiKey: "PROVIDER_SECRET", model: "MODEL_SECRET", baseUrl: "BASEURL_SECRET",
            toJSON: hook, [inspect.custom]: hook,
        };
        const sensitiveContext = {
            ...context, provider: instance, providerName: "ENV_SECRET", sessionId: "SESSION_SECRET",
            userId: "USER_SECRET", tenantId: "TENANT_SECRET", env: {API_KEY: "ENV_VALUE_SECRET"},
        };
        DraxAgentDiagnostics.report(error, sensitiveContext);
        const output = logger.mock.calls[0];
        expect(output[1]).toMatchObject({provider: "custom", diagnostic: {category: "authentication", upstreamCode: "invalid_api_key"}});
        const serialized = JSON.stringify(output);
        const inspected = inspect(output, {depth: null});
        for (const text of [serialized, inspected]) {
            expect(text).not.toMatch(/SECRET|sk-password|token-secret|prompt-secret|private\.test/);
            expect(text).not.toMatch(/sessionId|userId|tenantId|stack|cause|toJSON|authorization/);
        }
        expect(hook).not.toHaveBeenCalled();
    });

    test("does not invoke getters for even standard fields", () => {
        const getter = vi.fn(() => { throw new Error("GETTER_SECRET"); });
        const error = Object.create(null);
        for (const field of [
            "message", "name", "status", "statusCode", "code", "type", "error", "cause", "response",
            "headers", "request_id", "requestID", "requestId", "_request_id", "constructor", "param",
        ]) Object.defineProperty(error, field, {get: getter});
        expect(build(error).diagnostic.category).toBe("unknown");
        const hostileContext = Object.create(null);
        for (const field of Object.keys(context).concat("provider")) {
            Object.defineProperty(hostileContext, field, {get: getter});
        }
        expect(DraxAgentDiagnostics.build(error, hostileContext)).toMatchObject({
            agentIdentifier: "unknown", code: "unknown", provider: "unknown",
        });
        expect(getter).not.toHaveBeenCalled();
    });

    test("ignores unknown SDK strings rather than trying to redact arbitrary content", () => {
        const diagnostic = build({
            name: "a perfectly ordinary private prompt", status: "401", statusCode: 600,
            code: "private custom code", type: "private custom type", param: "private custom parameter",
            request_id: "private custom id", error: {code: "invalid_api_key\n", param: "tools[private prompt]"},
        }).diagnostic;
        expect(diagnostic).toEqual({category: "unknown", hint: expect.any(String)});
        expect(JSON.stringify(diagnostic)).not.toContain("private");
    });

    test.each([99, 600, -1, 401.5, NaN, Infinity, "401", null, {valueOf: () => 401}])(
        "rejects non-HTTP upstream status %s", status => {
            expect(build({status}).diagnostic).not.toHaveProperty("upstreamStatus");
        },
    );

    test.each([100, 200, 400, 499, 599])("allows only integer HTTP status %s", status => {
        expect(build({status}).diagnostic.upstreamStatus).toBe(status);
    });

    test.each(["model", "api_key", "response_format", "tools", "tool_choice", "messages", "max_tokens"])(
        "allows known upstream parameter %s", param => {
            expect(build({error: {param}}).diagnostic.upstreamParameter).toBe(param);
        },
    );

    test.each(["req_123abc", "req-backend-456", "req_" + "a".repeat(124)])(
        "allows bounded provider request ID, case %#", request_id => {
            expect(build({request_id}).diagnostic.requestId).toBe(request_id);
            expect(build({response: {headers: {"x-request-id": request_id}}}).diagnostic.requestId).toBe(request_id);
        },
    );

    test("allows a UUID only in the SDK x-request-id header", () => {
        const id = "550e8400-e29b-41d4-a716-446655440000";
        expect(build({requestId: id}).diagnostic).not.toHaveProperty("requestId");
        expect(build({headers: {"x-request-id": id}}).diagnostic.requestId).toBe(id);
        expect(build({headers: {"X-Request-Id": id}}).diagnostic.requestId).toBe(id);
        expect(build({headers: {authorization: id}}).diagnostic).not.toHaveProperty("requestId");
    });

    test.each(["req_", "req_private\n", "req_private\u2028", "req_" + "a".repeat(125),
        "req_hello secret", "req_https://secret", "arbitrary-safe-looking-id", "Bearer token"])(
        "rejects arbitrary/injected request ID, case %#", id => {
            expect(build({request_id: id, response: {headers: {"x-request-id": id}}}).diagnostic)
                .not.toHaveProperty("requestId");
        },
    );

    test.each(["secret\nforged", "secret\r", "secret\n", "secret\u0000", "secret\u001b[31m", "secret\u2028", "x".repeat(129)])(
        "rejects unsafe or oversized context identifiers, case %#", value => {
            const diagnostic = build({}, {agentIdentifier: value, code: value, stage: value, correlationId: value});
            expect(diagnostic).toMatchObject({agentIdentifier: "unknown", code: "unknown"});
            expect(diagnostic).not.toHaveProperty("stage");
            expect(diagnostic).not.toHaveProperty("correlationId");
        },
    );

    test("preserves bounded trusted identifiers and router type", () => {
        expect(build({}, {agentType: "router", agentIdentifier: "route:agent/1", code: "ROUTING_FAILED", stage: "route.select"}))
            .toMatchObject({agentType: "router", agentIdentifier: "route:agent/1", code: "ROUTING_FAILED", stage: "route.select"});
        expect(build({}, {stage: "x".repeat(65)})).not.toHaveProperty("stage");
        expect(build({}, {code: "x".repeat(97)}).code).toBe("unknown");
    });
});

describe("DraxAgentDiagnostics provider normalization", () => {
    test.each([
        ["OpenAi", "openai"], ["OpenAI", "openai"], ["openai", "openai"],
        ["DeepSeek", "deepseek"], ["DeepSeekAi", "deepseek"], ["Google", "google"], ["GoogleAi", "google"],
        ["Ollama", "ollama"], ["OllamaAi", "ollama"],
        ["OpenAiProvider", "openai"], ["DeepSeekAiProvider", "deepseek"],
        ["GoogleAiProvider", "google"], ["OllamaAiProvider", "ollama"],
        ["sk-secret-private-config", "custom"], ["__proto__", "custom"], ["constructor", "custom"],
        ["OpenAI\n", "custom"], ["x".repeat(5000), "custom"], ["", "unknown"], [undefined, "unknown"],
    ])("normalizes raw providerName without echoing unknown config, case %#", (providerName, provider) => {
        expect(build({}, {providerName}).provider).toBe(provider);
    });

    test("explicit provider instances override the raw environment name", () => {
        class OpenAiProvider {}
        class DeepSeekAiProvider {}
        class GoogleAiProvider {}
        class OllamaAiProvider {}
        class PrivateCustomProvider {}
        for (const [instance, normalized] of [
            [new OpenAiProvider(), "openai"], [new DeepSeekAiProvider(), "deepseek"],
            [new GoogleAiProvider(), "google"], [new OllamaAiProvider(), "ollama"],
            [new PrivateCustomProvider(), "custom"], [{providerName: "OpenAi", name: "OpenAiProvider"}, "custom"],
            [null, "custom"], ["OpenAi", "custom"],
        ] as const) {
            expect(build({}, {provider: instance, providerName: "Google"}).provider).toBe(normalized);
        }
        expect(build({}, {provider: undefined, providerName: "Google"}).provider).toBe("google");
    });
});

describe("DraxAgentDiagnostics bounded traversal and best-effort reporting", () => {
    test("handles cyclic causes without mutation", () => {
        const first: any = {message: "private"};
        const second = {cause: first, status: 403};
        first.cause = second;
        Object.freeze(first);
        Object.freeze(second);
        expect(build(first).diagnostic.category).toBe("permission");
        expect(first.cause).toBe(second);
        expect(second.cause).toBe(first);
    });

    test("inspects at most eight cause objects", () => {
        let root: object = {status: 401};
        for (let index = 0; index < 7; index++) root = {cause: root};
        expect(build(root).diagnostic.category).toBe("authentication");
        root = {cause: root};
        expect(build(root).diagnostic.category).toBe("unknown");
    });

    test("caps infinitely expanding cause/prototype proxies", () => {
        let reads = 0;
        function expanding(): object {
            return new Proxy({}, {
                get: () => { throw new Error("Unexpected property read"); },
                getOwnPropertyDescriptor: (_target, property) => {
                    reads++;
                    return property === "cause" ? {configurable: true, value: expanding()} : undefined;
                },
            });
        }
        expect(build(expanding()).diagnostic.category).toBe("unknown");
        expect(reads).toBeLessThan(2000);
        let prototypes = 0;
        function expandingPrototype(): object {
            return new Proxy({}, {getPrototypeOf: () => { prototypes++; return expandingPrototype(); }});
        }
        expect(build(expandingPrototype()).diagnostic.category).toBe("unknown");
        expect(prototypes).toBeLessThan(1000);
    });

    test("handles throwing/revoked proxies and hostile nested SDK objects", () => {
        const trap = vi.fn(() => { throw new Error("PROXY_SECRET"); });
        const hostile = new Proxy({}, {get: trap, getOwnPropertyDescriptor: trap, getPrototypeOf: trap});
        const revoked = Proxy.revocable({}, {});
        revoked.revoke();
        for (const error of [hostile, revoked.proxy, {error: hostile, response: hostile, cause: hostile}]) {
            expect(() => build(error, {provider: hostile})).not.toThrow();
            expect(JSON.stringify(build(error))).not.toContain("PROXY_SECRET");
        }
        expect(() => DraxAgentDiagnostics.build(hostile, hostile as DraxAgentDiagnosticContext)).not.toThrow();
    });

    test("deduplicates repeated reports and new wrappers by shared cause and correlation", () => {
        const logger = log();
        const root = new Error("private");
        const first = wrap(root);
        DraxAgentDiagnostics.report(first, context);
        DraxAgentDiagnostics.report(first, {...context, agentType: "router", stage: "routing"});
        DraxAgentDiagnostics.report(wrap(first), context);
        const siblingWrapper = wrap(root);
        DraxAgentDiagnostics.report(siblingWrapper, context);
        DraxAgentDiagnostics.report(siblingWrapper, context);
        expect(logger).toHaveBeenCalledTimes(1);
    });

    test("reports the same error again in each new correlation/turn", () => {
        const logger = log();
        const root = new Error("private");
        DraxAgentDiagnostics.report(wrap(root), context);
        DraxAgentDiagnostics.report(wrap(root), {...context, correlationId: "turn-002"});
        DraxAgentDiagnostics.report(root, {...context, correlationId: "turn-002"});
        expect(logger).toHaveBeenCalledTimes(2);
    });

    test("does not collapse independent routing/audio failures in the same correlation", () => {
        const logger = log();
        DraxAgentDiagnostics.report(wrap(new Error("routing")), {...context, stage: "routing"});
        DraxAgentDiagnostics.report(wrap(new Error("audio")), {...context, stage: "audio"});
        DraxAgentDiagnostics.report({}, context);
        DraxAgentDiagnostics.report({}, context);
        DraxAgentDiagnostics.report(undefined, context);
        DraxAgentDiagnostics.report(undefined, context);
        expect(logger).toHaveBeenCalledTimes(6);
    });

    test("does not deduplicate without a valid correlation or suppress later correlated calls", () => {
        const logger = log();
        const error = new Error("private");
        for (const correlationId of [undefined, undefined, "invalid\n", "invalid\n", "turn-001"]) {
            DraxAgentDiagnostics.report(error, {...context, correlationId});
        }
        expect(logger).toHaveBeenCalledTimes(5);
    });

    test("build is side-effect free: no logging, no dedupe registration and fresh output objects", () => {
        const logger = log();
        const error = new Error("DeepSeek apiKey required");
        const first = build(error);
        const second = build(error);
        expect(first).toEqual(second);
        expect(first).not.toBe(second);
        first.diagnostic.configurationKeys!.push("MUTATED");
        expect(second.diagnostic.configurationKeys).toEqual(["DEEPSEEK_API_KEY"]);
        expect(logger).not.toHaveBeenCalled();
        DraxAgentDiagnostics.report(error, context);
        expect(logger).toHaveBeenCalledTimes(1);
    });

    test("logger exceptions never change error flow or replace the original cause", () => {
        const error = wrap(new Error("original"));
        const cause = error.cause;
        vi.spyOn(console, "error").mockImplementation(() => { throw new Error("LOGGER_SECRET"); });
        expect(() => DraxAgentDiagnostics.report(error, context)).not.toThrow();
        expect(error.cause).toBe(cause);
    });

    test("sanitizer exceptions never escape report", () => {
        const logger = log();
        vi.spyOn(DraxAgentDiagnostics, "build").mockImplementation(() => { throw new Error("SANITIZER_SECRET"); });
        expect(() => DraxAgentDiagnostics.report(new Error("private"), context)).not.toThrow();
        expect(logger).not.toHaveBeenCalled();
    });
});
