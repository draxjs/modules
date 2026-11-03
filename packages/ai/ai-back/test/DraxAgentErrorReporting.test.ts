import {randomUUID} from "node:crypto";
import {inspect} from "node:util";
import Fastify, {type FastifyInstance} from "fastify";
import {DraxConfig} from "@drax/common-back";
import {afterEach, beforeEach, describe, expect, test, vi, type MockInstance} from "vitest";
import {DraxAgent} from "../src/agents/DraxAgent.js";
import {DraxAgentError} from "../src/agents/DraxAgentError.js";
import {DraxAgentRouter} from "../src/agents/DraxAgentRouter.js";
import type {DraxAgentDiagnostic} from "../src/agents/DraxAgentDiagnostics.js";
import {DraxAgentFactory} from "../src/factory/DraxAgentFactory.js";
import DraxAgentRoutes from "../src/routes/DraxAgentRoutes.js";
import type {
    DraxAgentAccessContext, DraxAgentConfig, DraxAgentMessageInput, DraxAgentPromptContext,
} from "../src/interfaces/IDraxAgent.js";
import type {DraxAgentRouterConfig} from "../src/interfaces/IDraxAgentRouter.js";
import type {IPromptAudioResponse, IPromptParams, IPromptResponse} from "../src/interfaces/IAIProvider.js";
import type {IAgentSessionBase} from "../src/interfaces/IAgentSession.js";

const boundaries = vi.hoisted(() => ({
    provider: vi.fn<() => NonNullable<DraxAgentConfig["provider"]>>(),
    persistence: vi.fn(() => { throw new Error("Unexpected persistence factory access"); }),
    audio: vi.fn<(input: IPromptParams, output: unknown) => Promise<IPromptAudioResponse | undefined>>(),
}));

// Keep the source registry, core, router and HTTP routes real, without loading SDKs, TTS or DBs.
vi.mock("../src/factory/ai/AiProviderFactory.js", () => ({default: {instance: boundaries.provider}}));
vi.mock("../src/factory/services/AgentSessionServiceFactory.js", () => ({
    default: {get instance() { return boundaries.persistence(); }},
}));
vi.mock("../src/services/PromptAudioService.js", () => ({default: {build: boundaries.audio}}));

const secrets = {
    sdk: "SDK_MESSAGE_SECRET_sk-private", stack: "STACK_SECRET_PRIVATE", payload: "PAYLOAD_SECRET_PRIVATE",
    headers: "RESPONSE_HEADERS_SECRET_PRIVATE", env: "ENV_API_KEY_SECRET_PRIVATE",
    prompt: "SYSTEM_PROMPT_SECRET_PRIVATE", user: "USER_MESSAGE_SECRET_PRIVATE",
    content: "USER_CONTENT_SECRET_PRIVATE", output: "CLASSIFICATION_OUTPUT_SECRET_PRIVATE",
    model: "MODEL_VALUE_SECRET_PRIVATE", db: "DATABASE_CAUSE_SECRET_PRIVATE",
};
const trusted: DraxAgentAccessContext = {
    userId: "reporting-user", tenantId: "reporting-tenant", permissions: ["tasks:write"], authenticated: true,
};
const answer: IPromptResponse = {output: "Respuesta final", tokens: 7, inputTokens: 5, outputTokens: 2, time: 3};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const servers: FastifyInstance[] = [];
let logger: MockInstance<typeof console.error>;
let cachedProvider: string | undefined;
let expectedFactoryCalls: number;

// Concrete class names intentionally match the diagnostic allowlist; no real provider is imported.
class OpenAiProvider {
    prompt = vi.fn<(input: IPromptParams) => Promise<IPromptResponse>>()
        .mockImplementation(async () => structuredClone(answer));
}
class CustomProvider extends OpenAiProvider {}

function input(overrides: Partial<DraxAgentMessageInput> = {}): DraxAgentMessageInput {
    return {
        message: secrets.user, userContent: [{type: "text", text: secrets.content}], model: secrets.model,
        userId: trusted.userId, tenantId: trusted.tenantId, accessContext: trusted, ...overrides,
    };
}

function context(): DraxAgentPromptContext {
    return {session: {
        id: randomUUID(), userId: trusted.userId, tenantId: trusted.tenantId,
        messages: [], createdAt: new Date(), updatedAt: new Date(),
    }};
}

function specialist(config: DraxAgentConfig = {}) {
    return DraxAgentFactory.register(new DraxAgent(randomUUID(), "Reporting specialist").configure({
        provider: new OpenAiProvider(), sessionService: false, systemPrompt: secrets.prompt,
        routing: {eligible: true, capabilities: "Gestionar tareas"}, ...config,
    }));
}

function router(target: DraxAgent, config: DraxAgentRouterConfig = {}) {
    return DraxAgentFactory.register(new DraxAgentRouter(randomUUID(), "Reporting router").configure({
        sessionService: false, candidateIdentifiers: [target.identifier], ...config,
    }));
}

function classification(output: unknown): OpenAiProvider {
    const provider = new OpenAiProvider();
    provider.prompt.mockResolvedValue({...answer, output});
    return provider;
}

function delegation(target: DraxAgent): OpenAiProvider {
    return classification({action: "delegate", agentIdentifier: target.identifier, message: null, requiresMultipleSpecialists: false});
}

function upstream(fields: Record<string, unknown> = {}) {
    return Object.assign(new Error(secrets.sdk), {
        stack: secrets.stack, payload: {body: secrets.payload},
        headers: {authorization: secrets.headers, "x-request-id": "req_reporting-123"},
        response: {data: {private: secrets.payload}, headers: {cookie: secrets.headers}},
        ...fields,
    });
}

async function rejection(operation: Promise<unknown>): Promise<DraxAgentError> {
    const error = await operation.then(() => undefined, error => error);
    expect(error).toBeInstanceOf(DraxAgentError);
    return error;
}

function diagnostic(index = 0): DraxAgentDiagnostic {
    expect(logger.mock.calls[index]?.[0]).toBe("[drax-agent] error");
    return logger.mock.calls[index][1];
}

function expectPrivate(value: unknown) {
    // Include non-enumerable properties: JSON.stringify alone would miss a raw Error argument/cause.
    const text = inspect(value, {depth: null, showHidden: true, customInspect: false, getters: false});
    for (const secret of Object.values(secrets)) expect(text).not.toContain(secret);
}

function expectHiddenCause(error: DraxAgentError, cause: unknown) {
    expect(error.cause).toBe(cause);
    expect(Object.getOwnPropertyDescriptor(error, "cause")).toMatchObject({value: cause, enumerable: false});
    expect(Object.keys(error)).not.toContain("cause");
    expect(JSON.parse(JSON.stringify(error))).not.toHaveProperty("cause");
    expectPrivate(JSON.parse(JSON.stringify(error)));
}

function persistence() {
    const record = {_id: randomUUID(), tokens: 0, inputTokens: 0, outputTokens: 0};
    const service = {
        findBy: vi.fn(async () => []),
        create: vi.fn(async (data: IAgentSessionBase) => ({...structuredClone(data), ...record})),
        findById: vi.fn(async () => ({...record})),
        updatePartial: vi.fn(async (_id: string, data: IAgentSessionBase) => ({...structuredClone(data), ...record})),
    };
    return service as typeof service & Exclude<DraxAgentConfig["sessionService"], false | undefined>;
}

async function server(defaultAgent: DraxAgent) {
    const app = Fastify();
    servers.push(app);
    app.addHook("onRequest", async request => {
        Object.assign(request, {rbac: {
            userId: trusted.userId, tenantId: trusted.tenantId, getRole: {permissions: [...trusted.permissions!]},
            assertPermission: vi.fn(),
        }});
    });
    await app.register(DraxAgentRoutes, {agentIdentifier: defaultAgent.identifier});
    await app.ready();
    return app;
}

beforeEach(() => {
    logger = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expectedFactoryCalls = 0;
    cachedProvider = undefined;
    const get = DraxConfig.get.bind(DraxConfig);
    // Do not mutate the shared DraxConfig cache (or reset modules/singleton registries).
    vi.spyOn(DraxConfig, "get").mockImplementation(key => key === "AI_PROVIDER" ? cachedProvider : get(key));
    vi.stubEnv("AI_PROVIDER", undefined);
    vi.stubEnv("OPENAI_API_KEY", secrets.env);
    boundaries.provider.mockReset().mockImplementation(() => { throw new Error("Unexpected provider factory access"); });
    boundaries.persistence.mockClear();
    boundaries.audio.mockReset().mockResolvedValue(undefined);
});

afterEach(async () => {
    try {
        await Promise.all(servers.splice(0).map(app => app.close()));
        expect(boundaries.provider).toHaveBeenCalledTimes(expectedFactoryCalls);
        expect(boundaries.persistence).not.toHaveBeenCalled();
        expectPrivate(logger.mock.calls);
        for (const call of logger.mock.calls) {
            expect(call).toHaveLength(2);
            expect(call[0]).toBe("[drax-agent] error");
            expect(Object.keys(call[1]).sort()).toEqual([
                "agentIdentifier", "agentType", "code", "correlationId", "diagnostic", "event", "provider", "stage",
            ]);
            expect(call[1].event).toBe("drax.agent.error");
            for (const key of Object.keys(call[1].diagnostic)) {
                expect(["category", "hint", "errorName", "upstreamStatus", "upstreamCode", "upstreamParameter", "requestId", "configurationKeys"]).toContain(key);
            }
        }
    } finally {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    }
});

describe("DraxAgent integrated error reporting", () => {
    test("send preserves raw cause identity transitively and logs once across turn/send wrappers", async () => {
        const raw = upstream({status: 401, code: "invalid_api_key"});
        const provider = new OpenAiProvider();
        provider.prompt.mockRejectedValue(raw);
        const agent = specialist({provider});
        const session = await agent.startSession(input());
        const error = await rejection(agent.sendMessage(input({sessionId: session.id, correlationId: "untrusted-correlation"})));

        expect(error).toMatchObject({code: "AGENT_TURN_FAILED", stage: "provider", statusCode: 500, sessionId: session.id});
        expect(error.correlationId).toMatch(uuid);
        expect(error.correlationId).not.toBe("untrusted-correlation");
        expectHiddenCause(error, error.cause);
        expect(error.cause).toBeInstanceOf(DraxAgentError);
        expectHiddenCause(error.cause as DraxAgentError, raw);
        expect((error.cause as DraxAgentError).correlationId).toBe(error.correlationId);
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic()).toMatchObject({
            agentIdentifier: agent.identifier, agentType: "specialist", code: error.code, stage: "provider",
            correlationId: error.correlationId, provider: "openai", diagnostic: {category: "authentication"},
        });
        expect(agent.getSession(input({sessionId: session.id}))?.messages).toEqual([]);
        expect(provider.prompt).toHaveBeenCalledTimes(1);
    });

    test("existing controlled errors retain the entire cause chain and completion flag", async () => {
        const raw = upstream({status: 503});
        const original = new DraxAgentError({
            code: "CUSTOM_OPERATION_FAILED", message: "Safe operation failure", statusCode: 502,
            stage: "execution", operationMayHaveCompleted: true, cause: raw,
        });
        const provider = new OpenAiProvider();
        provider.prompt.mockRejectedValue(original);
        const error = await rejection(specialist({provider}).sendMessage(input()));

        expect(error).toMatchObject({code: original.code, message: original.message, statusCode: 502, stage: "execution", operationMayHaveCompleted: true});
        expectHiddenCause(error, error.cause);
        expectHiddenCause(error.cause as DraxAgentError, original);
        expectHiddenCause(original, raw);
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic().correlationId).toBe(error.correlationId);
    });

    test("direct executeTurn generates a correlation UUID and recognizes a custom instance, not env", async () => {
        vi.stubEnv("AI_PROVIDER", "GoogleAi");
        const provider = new CustomProvider();
        const raw = upstream({code: "ECONNRESET"});
        provider.prompt.mockRejectedValue(raw);
        const agent = specialist({provider});
        const error = await rejection(agent.executeTurn(input(), context()));

        expectHiddenCause(error, raw);
        expect(error.correlationId).toMatch(uuid);
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic()).toMatchObject({provider: "custom", correlationId: error.correlationId, agentIdentifier: agent.identifier});
    });

    test("deduplication is scoped to correlation, not permanently to the raw cause", async () => {
        const raw = upstream({code: "ECONNRESET"});
        const provider = new OpenAiProvider();
        provider.prompt.mockRejectedValue(raw);
        const agent = specialist({provider});
        const first = await rejection(agent.executeTurn(input({correlationId: randomUUID()}), context()));
        const second = await rejection(agent.executeTurn(input({correlationId: randomUUID()}), context()));

        expect(first.cause).toBe(raw);
        expect(second.cause).toBe(raw);
        expect(logger).toHaveBeenCalledTimes(2);
        expect(diagnostic(0).correlationId).toBe(first.correlationId);
        expect(diagnostic(1).correlationId).toBe(second.correlationId);
        expect(first.correlationId).not.toBe(second.correlationId);
    });

    test.each([
        {message: "OpenAI apiKey required", env: undefined, cache: undefined, provider: "openai", key: "OPENAI_API_KEY"},
        {message: "OpenAI model required", env: "OpenAi", cache: undefined, provider: "openai", key: "OPENAI_MODEL"},
        {message: "DeepSeek apiKey required", env: "DeepSeekAi", cache: undefined, provider: "deepseek", key: "DEEPSEEK_API_KEY"},
        {message: "Google AI model required", env: "OpenAi", cache: "GoogleAi", provider: "google", key: "GOOGLE_AI_MODEL"},
    ])("factory initialization: $message reports configuration keys without reinitializing", async row => {
        vi.stubEnv("AI_PROVIDER", row.env);
        cachedProvider = row.cache;
        const raw = new Error(row.message);
        expectedFactoryCalls = 1;
        boundaries.provider.mockImplementation(() => { throw raw; });
        const agent = specialist({provider: undefined});
        const error = await rejection(agent.sendMessage(input()));

        expect((error.cause as DraxAgentError).cause).toBe(raw);
        expect(error).toMatchObject({code: "AGENT_TURN_FAILED", stage: "provider"});
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic()).toMatchObject({
            provider: row.provider, correlationId: error.correlationId,
            diagnostic: {category: "configuration", configurationKeys: [row.key]},
        });
    });

    test("provider returned by the factory is the diagnostic source even when env disagrees", async () => {
        vi.stubEnv("AI_PROVIDER", "GoogleAi");
        const provider = new OpenAiProvider();
        provider.prompt.mockRejectedValue(upstream({status: 401}));
        expectedFactoryCalls = 1;
        boundaries.provider.mockReturnValue(provider);
        const error = await rejection(specialist({provider: undefined}).sendMessage(input()));

        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic()).toMatchObject({provider: "openai", stage: "provider", correlationId: error.correlationId});
        expect(provider.prompt).toHaveBeenCalledTimes(1);
    });

    test("prompt construction failures preserve the cause and never call the provider", async () => {
        const raw = upstream();
        const provider = new OpenAiProvider();
        const agent = specialist({provider, systemPrompt: () => { throw raw; }});
        const error = await rejection(agent.sendMessage(input()));

        expect((error.cause as DraxAgentError).cause).toBe(raw);
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic()).toMatchObject({agentIdentifier: agent.identifier, stage: "prompt", code: "AGENT_TURN_FAILED"});
        expect(provider.prompt).not.toHaveBeenCalled();
    });

    test.each([
        {status: 404, code: "model_not_found", category: "model"},
        {status: 429, code: "insufficient_quota", category: "quota"},
        {status: 429, code: "rate_limit_exceeded", category: "rate_limit"},
        {status: undefined, code: "ENOTFOUND", category: "network"},
    ])("provider failure $code is classified through real core wrappers", async row => {
        const raw = upstream({status: row.status, error: {code: row.code, param: "model", message: secrets.sdk, model: secrets.model}});
        const provider = new OpenAiProvider();
        provider.prompt.mockRejectedValue(raw);
        const error = await rejection(specialist({provider}).sendMessage(input()));

        expect((error.cause as DraxAgentError).cause).toBe(raw);
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic()).toMatchObject({diagnostic: {
            category: row.category, upstreamCode: row.code, upstreamParameter: "model", requestId: "req_reporting-123",
            ...(row.status === undefined ? {} : {upstreamStatus: row.status}),
        }});
        expectPrivate(JSON.parse(JSON.stringify(error)));
    });

    test("real default HTTP route keeps SDK authentication details out of its payload", async () => {
        const raw = upstream({name: "AuthenticationError", status: 401, error: {code: "invalid_api_key", message: secrets.sdk}});
        const provider = new OpenAiProvider();
        provider.prompt.mockRejectedValue(raw);
        const authorize = vi.fn((access: DraxAgentAccessContext) => access.userId === trusted.userId);
        const agent = specialist({provider, access: {requireUser: true, permissions: ["tasks:write"], authorize}});
        const app = await server(agent);
        const response = await app.inject({method: "POST", url: "/api/ai/agent/message", payload: {
            message: secrets.user, userContent: [{type: "text", text: secrets.content}], model: secrets.model,
            userId: "forged-user", accessContext: {userId: "forged-user"},
        }});
        const body = response.json();

        expect(response.statusCode).toBe(500);
        expect(body).toEqual({
            message: "Unable to execute the agent turn.", correlationId: expect.stringMatching(uuid), sessionId: expect.stringMatching(uuid),
            error: {code: "AGENT_TURN_FAILED", message: "Unable to execute the agent turn.", stage: "provider"},
        });
        expect(authorize).toHaveBeenCalledWith(trusted);
        expect(provider.prompt).toHaveBeenCalledWith(expect.objectContaining({user: trusted.userId, tenant: trusted.tenantId}));
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic()).toMatchObject({
            agentIdentifier: agent.identifier, correlationId: body.correlationId, provider: "openai",
            diagnostic: {category: "authentication", upstreamStatus: 401, upstreamCode: "invalid_api_key", requestId: "req_reporting-123"},
        });
        expectPrivate(body);
    });
});

describe("DraxAgentRouter integrated error reporting", () => {
    test("routing failure uses the routing provider, not the fallback provider, and preserves the safe response", async () => {
        const execution = new OpenAiProvider();
        const target = specialist({provider: execution});
        const routing = new CustomProvider();
        routing.prompt.mockRejectedValue(upstream({status: 401, code: "invalid_api_key"}));
        const fallback = new OpenAiProvider();
        const agent = router(target, {routingProvider: routing, provider: fallback});
        const result = await agent.sendMessage(input());

        expect(result).toMatchObject({
            message: "No pude determinar qué especialista debe atenderte. No ejecuté ninguna operación.",
            error: {code: "ROUTING_PROVIDER_FAILED", stage: "routing", statusCode: 502},
        });
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic()).toMatchObject({
            agentIdentifier: agent.identifier, agentType: "router", provider: "custom", stage: "routing",
            code: "ROUTING_PROVIDER_FAILED", correlationId: result.correlationId, diagnostic: {category: "authentication"},
        });
        expect(execution.prompt).not.toHaveBeenCalled();
        expect(fallback.prompt).not.toHaveBeenCalled();
        expect(routing.prompt).toHaveBeenCalledTimes(1);
        expectPrivate(result);
    });

    test("invalid classification JSON containing private output is reported without leaking it", async () => {
        const execution = new OpenAiProvider();
        const target = specialist({provider: execution});
        const routing = classification(`invalid-json-${secrets.output}`);
        const agent = router(target, {routingProvider: routing});
        const result = await agent.sendMessage(input());

        expect(result).toMatchObject({
            message: "No pude validar la selección del especialista. No ejecuté ninguna operación.",
            error: {code: "ROUTING_DECISION_INVALID", stage: "routing", statusCode: 502},
        });
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic()).toMatchObject({agentIdentifier: agent.identifier, code: "ROUTING_DECISION_INVALID", provider: "openai", correlationId: result.correlationId});
        expect(execution.prompt).not.toHaveBeenCalled();
        expectPrivate(result);
    });

    test("delegated core failure reports only the specialist with the shared correlation and never retries tools", async () => {
        const write = vi.fn(async () => ({id: "written-once"}));
        const raw = upstream({code: "ECONNRESET"});
        const execution = new OpenAiProvider();
        execution.prompt.mockImplementation(async params => { await params.tools![0].execute({}); throw raw; });
        const target = specialist({provider: execution, tools: [{name: "write", description: "Write task", execute: write}]});
        const routing = delegation(target);
        const agent = router(target, {routingProvider: routing});
        const result = await agent.sendMessage(input());

        expect(result).toMatchObject({resolvedAgentIdentifier: target.identifier, error: {
            code: "SPECIALIST_EXECUTION_FAILED", stage: "execution", statusCode: 502, operationMayHaveCompleted: true,
        }});
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic()).toMatchObject({
            agentIdentifier: target.identifier, agentType: "specialist", code: "AGENT_TURN_FAILED", stage: "provider",
            provider: "openai", correlationId: result.correlationId, diagnostic: {category: "network"},
        });
        expect(write).toHaveBeenCalledTimes(1);
        expect(execution.prompt).toHaveBeenCalledTimes(1);
        expect(routing.prompt).toHaveBeenCalledTimes(1);
        expectPrivate(result);
    });

    test("unwrapped custom executeTurn override is reported by the router as custom", async () => {
        const raw = upstream({status: 503});
        class CustomAgent extends DraxAgent {
            override async executeTurn(): Promise<never> { throw raw; }
        }
        const target = DraxAgentFactory.register(new CustomAgent(randomUUID()).configure({
            sessionService: false, routing: {eligible: true, capabilities: "Custom execution"},
        }));
        const execute = vi.spyOn(target, "executeTurn");
        const agent = router(target, {routingProvider: delegation(target), provider: new OpenAiProvider()});
        const result = await agent.sendMessage(input());

        expect(result.error).toMatchObject({code: "SPECIALIST_EXECUTION_FAILED", operationMayHaveCompleted: true});
        expect(execute).toHaveBeenCalledTimes(1);
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic()).toMatchObject({
            agentIdentifier: agent.identifier, agentType: "router", provider: "custom", code: "SPECIALIST_EXECUTION_FAILED",
            stage: "execution", correlationId: result.correlationId, diagnostic: {category: "upstream", upstreamStatus: 503},
        });
    });

    test("routing and audio failures are independently reported under the same correlation", async () => {
        const target = specialist();
        const routing = new OpenAiProvider();
        routing.prompt.mockRejectedValue(upstream({status: 401}));
        boundaries.audio.mockRejectedValue(upstream({code: "ETIMEDOUT"}));
        const agent = router(target, {routingProvider: routing});
        const result = await agent.sendMessage(input({audioResponse: true}));

        expect(result).toMatchObject({
            message: "No pude determinar qué especialista debe atenderte. No ejecuté ninguna operación.",
            error: {code: "ROUTING_PROVIDER_FAILED", stage: "routing", statusCode: 502, audioFailed: true},
        });
        expect(logger).toHaveBeenCalledTimes(2);
        expect(diagnostic(0)).toMatchObject({code: "ROUTING_PROVIDER_FAILED", correlationId: result.correlationId, provider: "openai"});
        expect(diagnostic(1)).toMatchObject({
            code: "ROUTER_AUDIO_FAILED", stage: "audio", correlationId: result.correlationId,
            agentIdentifier: agent.identifier, provider: "unknown", diagnostic: {category: "network"},
        });
        expect(boundaries.audio).toHaveBeenCalledTimes(1);
        expectPrivate(result);
    });

    test("audio failure preserves a completed specialist result, tokens and side effects", async () => {
        const write = vi.fn(async () => ({id: "written-once"}));
        const execution = new OpenAiProvider();
        execution.prompt.mockImplementation(async params => { await params.tools![0].execute({}); return {...answer}; });
        const target = specialist({provider: execution, tools: [{name: "write", description: "Write task", execute: write}]});
        boundaries.audio.mockRejectedValue(upstream({status: 503}));
        const agent = router(target, {routingProvider: delegation(target)});
        const result = await agent.sendMessage(input({audioResponse: true}));

        expect(result).toMatchObject({
            message: answer.output, output: answer.output, tokens: 14, resolvedAgentIdentifier: target.identifier,
            error: {code: "ROUTER_AUDIO_FAILED", stage: "audio", audioFailed: true, operationMayHaveCompleted: false},
        });
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic()).toMatchObject({code: "ROUTER_AUDIO_FAILED", provider: "unknown", correlationId: result.correlationId});
        expect(write).toHaveBeenCalledTimes(1);
        expect(execution.prompt).toHaveBeenCalledTimes(1);
        expect(boundaries.audio).toHaveBeenCalledTimes(1);
    });
});

describe("persistence and best-effort diagnostics", () => {
    test("post-turn persistence preserves the DB cause chain and authorized session id", async () => {
        const raw = new Error(secrets.db);
        const service = persistence();
        service.updatePartial.mockRejectedValue(raw);
        const provider = new OpenAiProvider();
        const agent = specialist({provider, sessionService: service});
        const session = await agent.startSession(input());
        const error = await rejection(agent.sendMessage(input({sessionId: session.id})));

        expect(error).toMatchObject({
            code: "SESSION_PERSISTENCE_INDETERMINATE", stage: "persistence", statusCode: 500,
            sessionId: session.id, operationMayHaveCompleted: true,
        });
        expectHiddenCause(error, error.cause);
        expectHiddenCause(error.cause as DraxAgentError, raw);
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic()).toMatchObject({code: error.code, stage: "persistence", correlationId: error.correlationId, agentIdentifier: agent.identifier});
        expect(provider.prompt).toHaveBeenCalledTimes(1);
        expect(service.updatePartial).toHaveBeenCalledTimes(1);
    });

    test("real HTTP persistence failure exposes the canonical session id, not the cause, and blocks tool replay", async () => {
        const service = persistence();
        service.updatePartial.mockRejectedValue(new Error(secrets.db));
        const write = vi.fn(async () => ({id: "written-once"}));
        const provider = new OpenAiProvider();
        provider.prompt.mockImplementation(async params => { await params.tools![0].execute({}); return {...answer}; });
        const agent = specialist({provider, sessionService: service, access: {requireUser: true}, tools: [{name: "write", description: "Write task", execute: write}]});
        const app = await server(agent);
        const first = await app.inject({method: "POST", url: "/api/ai/agent/message", payload: {message: secrets.user}});
        const body = first.json();

        expect(first.statusCode).toBe(500);
        expect(body).toMatchObject({sessionId: expect.stringMatching(uuid), correlationId: expect.stringMatching(uuid), error: {
            code: "SESSION_PERSISTENCE_INDETERMINATE", stage: "persistence", operationMayHaveCompleted: true,
        }});
        expect(body.message).toContain("Do not retry");
        expect(service.create.mock.calls[0][0]).toMatchObject({sessionId: body.sessionId, user: trusted.userId, tenant: trusted.tenantId});
        expect(logger).toHaveBeenCalledTimes(1);
        expect(diagnostic().correlationId).toBe(body.correlationId);
        expectPrivate(body);
        const blocked = await app.inject({method: "POST", url: "/api/ai/agent/message", payload: {message: secrets.user, sessionId: body.sessionId}});
        expect(blocked.statusCode).toBe(500);
        expect(blocked.json()).toMatchObject({sessionId: body.sessionId, error: {code: "SESSION_PERSISTENCE_INDETERMINATE", operationMayHaveCompleted: true}});
        expectPrivate(blocked.json());
        expect(write).toHaveBeenCalledTimes(1);
        expect(provider.prompt).toHaveBeenCalledTimes(1);
        expect(service.updatePartial).toHaveBeenCalledTimes(1);
        expect(logger).toHaveBeenCalledTimes(2);
    });

    test("throwing logger cannot replace the controlled error or trigger another tool execution", async () => {
        logger.mockImplementation(() => { throw new Error("Logger unavailable"); });
        const raw = upstream({status: 503});
        const write = vi.fn(async () => ({id: "written-once"}));
        const provider = new OpenAiProvider();
        provider.prompt.mockImplementation(async params => { await params.tools![0].execute({}); throw raw; });
        const agent = specialist({provider, tools: [{name: "write", description: "Write task", execute: write}]});
        const error = await rejection(agent.sendMessage(input()));

        expect(error).toMatchObject({code: "AGENT_TURN_FAILED", message: "Unable to execute the agent turn.", stage: "provider"});
        expect((error.cause as DraxAgentError).cause).toBe(raw);
        expect(logger).toHaveBeenCalledTimes(1);
        expect(write).toHaveBeenCalledTimes(1);
        expect(provider.prompt).toHaveBeenCalledTimes(1);
    });

    test("throwing logger cannot replace the router's safe fallback response", async () => {
        logger.mockImplementation(() => { throw new Error("Logger unavailable"); });
        const target = specialist();
        const routing = new OpenAiProvider();
        routing.prompt.mockRejectedValue(upstream({status: 401}));
        const agent = router(target, {routingProvider: routing});
        const result = await agent.sendMessage(input());

        expect(result).toMatchObject({
            message: "No pude determinar qué especialista debe atenderte. No ejecuté ninguna operación.",
            error: {code: "ROUTING_PROVIDER_FAILED", statusCode: 502},
        });
        expect(logger).toHaveBeenCalledTimes(1);
        expect(routing.prompt).toHaveBeenCalledTimes(1);
        expectPrivate(result);
    });

    test("successful core and delegated router turns emit no error diagnostics", async () => {
        const target = specialist();
        const direct = await target.sendMessage(input());
        const agent = router(target, {routingProvider: delegation(target)});
        const delegated = await agent.sendMessage(input());

        expect(direct.message).toBe(answer.output);
        expect(delegated).toMatchObject({message: answer.output, resolvedAgentIdentifier: target.identifier});
        expect(direct).not.toHaveProperty("error");
        expect(delegated).not.toHaveProperty("error");
        expect(logger).not.toHaveBeenCalled();
    });
});
