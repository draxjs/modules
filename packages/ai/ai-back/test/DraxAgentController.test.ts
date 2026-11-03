import Fastify, {type FastifyInstance} from "fastify";
import {DraxAgent} from "../src/agents/DraxAgent.js";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";
import {DraxAgentError} from "../src/agents/DraxAgentError.js";
import DraxAgentRoutes from "../src/routes/DraxAgentRoutes.js";
import type {DraxAgentAccessContext, DraxAgentKind, DraxAgentRoutingConfig} from "../src/interfaces/IDraxAgent.js";
import type {DraxAgentControllerOptions} from "../src/interfaces/IDraxAgentController.js";

const factory = vi.hoisted(() => {
    const registry = new Map<string, any>();
    return {
        registry,
        lookup: vi.fn((identifier: string) => registry.get(identifier)),
        agents: vi.fn(() => [...registry.values()]),
        instance: vi.fn(),
    };
});

// Exercise the actual HTTP routes, but never initialize providers, sessions or a database.
vi.mock("../src/factory/DraxAgentFactory.js", () => ({default: factory}));
vi.mock("../src/factory/ai/AiProviderFactory.js", () => ({
    default: {instance: () => { throw new Error("Unexpected provider access"); }},
}));
vi.mock("../src/factory/services/AgentSessionServiceFactory.js", () => ({
    default: {get instance() { throw new Error("Unexpected persistence access"); }},
}));

const prefix = "/api/ai/agent";
const servers: FastifyInstance[] = [];
const trusted: DraxAgentAccessContext = {
    userId: "server-user", tenantId: "server-tenant", permissions: ["agent:session", "private:read"], authenticated: true,
};
const result = {
    agentIdentifier: "manual", sessionId: "session", message: "answer", output: {text: "answer"},
    tokens: 5, inputTokens: 3, outputTokens: 2, time: 12,
    correlationId: "turn-correlation", resolvedAgentIdentifier: "specialist", metrics: {routing: 4},
};

function rbac() {
    return {
        userId: trusted.userId, tenantId: trusted.tenantId,
        getRole: {permissions: [...trusted.permissions!]},
        assertPermission: vi.fn(),
    };
}

function registerAgent(identifier = "manual", options: {
    type?: DraxAgentKind;
    routing?: DraxAgentRoutingConfig;
    authorize?: (context: DraxAgentAccessContext) => boolean | Promise<boolean>;
} = {}) {
    const agent = {
        identifier, description: `Description of ${identifier}`, type: options.type ?? "specialist",
        routing: options.routing,
        access: {permissions: ["private:read"]}, systemPrompt: "PRIVATE PROMPT", tools: ["PRIVATE TOOL"],
        configure: vi.fn(),
        canAccess: vi.fn(async (context: DraxAgentAccessContext) => options.authorize ? await options.authorize(context) : true),
        assertAgentAccess: vi.fn(async (context: DraxAgentAccessContext) => {
            if (!await agent.canAccess(context)) {
                throw new DraxAgentError({
                    code: "AGENT_ACCESS_DENIED", statusCode: 403, stage: "access", message: "Access denied.",
                });
            }
        }),
        startSession: vi.fn(async (_input: any) => ({
            id: "session", createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-02"),
        })),
        sendMessage: vi.fn(async (_input: any) => structuredClone(result)),
    };
    factory.registry.set(identifier, agent);
    return agent;
}

async function server(auth: any = rbac(), options: DraxAgentControllerOptions = {permission: false, agentIdentifier: "manual"}) {
    const app = Fastify();
    servers.push(app);
    app.addHook("onRequest", async request => { (request as any).rbac = typeof auth === "function" ? auth() : auth; });
    await app.register(DraxAgentRoutes, options);
    await app.ready();
    return app;
}

beforeEach(() => {
    factory.registry.clear();
    vi.clearAllMocks();
    factory.instance.mockImplementation((identifier: string) => registerAgent(identifier));
});

afterEach(async () => {
    await Promise.all(servers.splice(0).map(app => app.close()));
});

describe("DraxAgentController HTTP", () => {
    test("preserves the legacy GET and session response structures without metadata", async () => {
        registerAgent();
        const app = await server();
        const catalog = await app.inject({method: "GET", url: prefix});
        expect(catalog.statusCode).toBe(200);
        expect(catalog.json()).toEqual({agents: [{identifier: "manual", description: "Description of manual"}]});
        const session = await app.inject({method: "POST", url: `${prefix}/session`, payload: {}});
        expect(session.statusCode).toBe(200);
        expect(session.json()).toEqual({
            agentIdentifier: "manual", sessionId: "session",
            createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z",
        });
    });

    test("filters the catalog per request and only exposes public routing metadata", async () => {
        const restricted = registerAgent("private", {authorize: async context => context.permissions!.includes("private:read")});
        registerAgent("disabled", {type: "router", routing: {enabled: false, recommended: true}});
        registerAgent("denied-router", {type: "router", routing: {recommended: true}, authorize: async () => false});
        registerAgent("legacy");
        const routing = {eligible: true, enabled: true, capabilities: "search", examples: ["find"], recommended: true};
        registerAgent("specialist", {routing: {...routing, access: "SECRET", prompt: "SECRET", tools: ["SECRET"]} as any});
        registerAgent("router", {type: "router", routing: {recommended: true}});
        registerAgent("plain-router", {type: "router"});
        const app = await server({userId: "other", tenantId: null, getRole: {permissions: []}});
        const response = await app.inject({method: "GET", url: prefix});
        expect(response.json()).toEqual({
            agents: [
                {identifier: "legacy", description: "Description of legacy"},
                {identifier: "specialist", description: "Description of specialist", type: "specialist", routing},
                {identifier: "router", description: "Description of router", type: "router", routing: {recommended: true}},
                {identifier: "plain-router", description: "Description of plain-router", type: "router"},
            ],
            recommendedAgentIdentifier: "router",
        });
        expect(response.body).not.toMatch(/SECRET|PRIVATE|systemPrompt|access|tools/);
        expect(restricted.canAccess).toHaveBeenCalledWith({userId: "other", tenantId: null, permissions: [], authenticated: true});
        const authorized = await server();
        const second = await authorized.inject({method: "GET", url: prefix});
        expect(second.json().agents.map((entry: any) => entry.identifier)).toContain("private");
        expect(factory.instance).not.toHaveBeenCalled();
    });

    test("does not recommend unauthorized/disabled routers or recommended specialists", async () => {
        registerAgent("specialist", {routing: {recommended: true}});
        registerAgent("disabled", {type: "router", routing: {enabled: false, recommended: true}});
        registerAgent("denied", {type: "router", routing: {recommended: true}, authorize: () => false});
        const app = await server();
        const response = await app.inject({method: "GET", url: prefix});
        expect(response.json()).not.toHaveProperty("recommendedAgentIdentifier");
        expect(response.json().agents).toHaveLength(1);
    });

    test("creates the implicit legacy default once, never on requests", async () => {
        const app = await server(undefined, {permission: false});
        expect(factory.instance).toHaveBeenCalledExactlyOnceWith("default", "");
        await app.inject({method: "GET", url: prefix});
        await app.inject({method: "POST", url: `${prefix}/session`, payload: {}});
        expect(factory.instance).toHaveBeenCalledTimes(1);
    });

    test("preserves a registered router at the default identifier", async () => {
        const router = registerAgent("default", {type: "router"});
        const app = await server(undefined, {permission: false});
        const response = await app.inject({method: "POST", url: `${prefix}/message`, payload: {message: "hello"}});
        expect(response.statusCode).toBe(200);
        expect(router.sendMessage).toHaveBeenCalledOnce();
        expect(factory.instance).not.toHaveBeenCalled();
        expect(router.configure).not.toHaveBeenCalled();
    });

    test("allows explicit identifiers to be registered after controller bootstrap", async () => {
        const app = await server();
        expect(factory.instance).not.toHaveBeenCalled();
        const agent = registerAgent();
        const response = await app.inject({method: "POST", url: `${prefix}/session`, payload: {}});
        expect(response.statusCode).toBe(200);
        expect(agent.startSession).toHaveBeenCalledOnce();
    });

    test.each(["session", "message"])("unknown identifiers on %s return 404 without creating agents", async endpoint => {
        const agent = registerAgent();
        const app = await server();
        for (const identifier of ["unknown", "__proto__", "constructor"]) {
            const response = await app.inject({method: "POST", url: `${prefix}/${endpoint}`, payload: {identifier, message: "hello"}});
            expect(response.statusCode).toBe(404);
            expect(response.json()).toEqual({message: "Agent not found.", error: {code: "AGENT_NOT_FOUND", message: "Agent not found."}});
        }
        expect(factory.instance).not.toHaveBeenCalled();
        expect(factory.registry.size).toBe(1);
        expect(agent.startSession).not.toHaveBeenCalled();
        expect(agent.sendMessage).not.toHaveBeenCalled();
    });

    test("an unregistered explicit default returns 404 instead of creating it", async () => {
        const app = await server();
        const response = await app.inject({method: "POST", url: `${prefix}/session`, payload: {}});
        expect(response.statusCode).toBe(404);
        expect(factory.instance).not.toHaveBeenCalled();
    });

    for (const endpoint of ["session", "message"]) {
        test.each(["spoofed", null, {id: "spoofed"}])(`%s body identities are ignored on ${endpoint}`, async spoofed => {
            const agent = registerAgent();
            const app = await server();
            const response = await app.inject({method: "POST", url: `${prefix}/${endpoint}`, payload: {
                userId: spoofed, tenantId: spoofed, message: "hello", sessionId: "existing",
                accessContext: {userId: "attacker", permissions: ["admin"], authenticated: true},
                history: ["PRIVATE HISTORY"], session: {id: "attacker"}, correlationId: "attacker",
            }});
            expect(response.statusCode).toBe(200);
            expect(agent.assertAgentAccess).toHaveBeenCalledExactlyOnceWith(trusted);
            const operation = endpoint === "session" ? agent.startSession : agent.sendMessage;
            expect(operation).toHaveBeenCalledOnce();
            const input = operation.mock.calls[0][0];
            expect(input).toMatchObject({sessionId: "existing", userId: trusted.userId, tenantId: trusted.tenantId, accessContext: trusted});
            expect(input).not.toHaveProperty("history");
            expect(input).not.toHaveProperty("session");
            expect(input).not.toHaveProperty("correlationId");
            expect(agent.assertAgentAccess.mock.invocationCallOrder[0]).toBeLessThan(operation.mock.invocationCallOrder[0]);
            expect(agent.configure).not.toHaveBeenCalled();
        });

        test.each(["specialist", "router"] as const)(`denied %s cannot execute ${endpoint}`, async type => {
            const agent = registerAgent("manual", {type, authorize: async () => false});
            const app = await server();
            const response = await app.inject({method: "POST", url: `${prefix}/${endpoint}`, payload: {message: "hello"}});
            expect(response.statusCode).toBe(403);
            expect(response.json().error).toMatchObject({code: "AGENT_ACCESS_DENIED", stage: "access"});
            expect(agent.assertAgentAccess).toHaveBeenCalledExactlyOnceWith(trusted);
            expect(agent.startSession).not.toHaveBeenCalled();
            expect(agent.sendMessage).not.toHaveBeenCalled();
        });

        test.each(["specialist", "router"] as const)(`disabled %s cannot execute ${endpoint} even when access allows`, async type => {
            const agent = registerAgent("manual", {type, routing: {enabled: false}});
            const app = await server();
            const response = await app.inject({method: "POST", url: `${prefix}/${endpoint}`, payload: {message: "hello"}});
            expect(response.statusCode).toBe(403);
            expect(response.json().error.code).toBe("AGENT_ACCESS_DENIED");
            expect(agent.startSession).not.toHaveBeenCalled();
            expect(agent.sendMessage).not.toHaveBeenCalled();
        });
    }

    test.each(["absent", "null", "null getters", "throwing getters"])("never falls back to body identity with RBAC %s", async mode => {
        const agent = registerAgent();
        const auth = mode === "absent" ? undefined : mode === "null" ? null : mode === "null getters"
            ? {userId: null, tenantId: null, getRole: null}
            : {
                get userId() { throw new TypeError("null user"); },
                get tenantId() { throw new TypeError("null tenant"); },
                get getRole() { throw new TypeError("null role"); },
            };
        const app = await server(() => auth);
        for (const endpoint of ["session", "message"]) {
            const response = await app.inject({method: "POST", url: `${prefix}/${endpoint}`, payload: {
                message: "hello", userId: "attacker", tenantId: "attacker", accessContext: trusted,
            }});
            expect(response.statusCode).toBe(200);
        }
        const anonymous = {userId: null, tenantId: null, permissions: [], authenticated: false};
        expect(agent.startSession).toHaveBeenCalledWith({sessionId: undefined, userId: null, tenantId: null, accessContext: anonymous});
        expect(agent.sendMessage.mock.calls[0][0]).toMatchObject({userId: null, tenantId: null, accessContext: anonymous});
    });

    test.each(["missing", "null", "throws", "invalid"])("role permissions fail closed when %s", async mode => {
        const auth: any = {userId: "server-user", tenantId: "server-tenant", permissions: ["private:read"], getAuthUser: trusted};
        if (mode === "null") auth.getRole = null;
        if (mode === "throws") Object.defineProperty(auth, "getRole", {get() { throw new Error("role unavailable"); }});
        if (mode === "invalid") auth.getRole = {permissions: ["private:read", null]};
        const agent = registerAgent("manual", {authorize: context => context.permissions!.includes("private:read")});
        const app = await server(auth);
        const catalog = await app.inject({method: "GET", url: prefix});
        expect(catalog.json()).toEqual({agents: []});
        const response = await app.inject({method: "POST", url: `${prefix}/message`, payload: {message: "hello", permissions: ["private:read"]}});
        expect(response.statusCode).toBe(403);
        expect(agent.assertAgentAccess).toHaveBeenCalledWith({...trusted, permissions: []});
        expect(agent.sendMessage).not.toHaveBeenCalled();
    });

    test("uses the configured route permission and fails closed without an RBAC assertion", async () => {
        registerAgent();
        const auth = rbac();
        const app = await server(auth, {agentIdentifier: "manual"});
        expect((await app.inject({method: "GET", url: prefix})).statusCode).toBe(200);
        expect(auth.assertPermission).toHaveBeenCalledExactlyOnceWith("agent:session");
        const anonymous = await server(null, {agentIdentifier: "manual"});
        const response = await anonymous.inject({method: "GET", url: prefix});
        expect(response.statusCode).toBe(401);
        expect(response.json().error.code).toBe("UNAUTHENTICATED");
    });

    test.each([undefined, 503])("turn errors preserve the entire payload and use HTTP error status %s", async statusCode => {
        const agent = registerAgent();
        const failed = {...result, error: {code: "PROVIDER_FAILED", message: "Provider unavailable.", stage: "turn", ...(statusCode ? {statusCode} : {})}, errors: ["detail"], audio: {url: "audio"}};
        agent.sendMessage.mockResolvedValue(failed);
        const app = await server();
        const response = await app.inject({method: "POST", url: `${prefix}/message`, payload: {message: "hello"}});
        expect(response.statusCode).toBe(statusCode ?? 502);
        expect(response.json()).toEqual(failed);
    });

    test("successful turns retain their original payload and HTTP 200", async () => {
        registerAgent();
        const app = await server();
        const response = await app.inject({method: "POST", url: `${prefix}/message`, payload: {message: "hello"}});
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual(result);
    });

    test.each(["session", "message"])("controlled %s errors expose code, stage and correlation", async endpoint => {
        const agent = registerAgent();
        const error = new DraxAgentError({code: "SESSION_CONFLICT", message: "Session conflict.", statusCode: 409, stage: "session", correlationId: "correlation"});
        agent.startSession.mockRejectedValue(error);
        agent.sendMessage.mockRejectedValue(error);
        const app = await server();
        const response = await app.inject({method: "POST", url: `${prefix}/${endpoint}`, payload: {message: "hello"}});
        expect(response.statusCode).toBe(409);
        expect(response.json()).toEqual({message: "Session conflict.", correlationId: "correlation", error: {code: "SESSION_CONFLICT", message: "Session conflict.", stage: "session"}});
    });

    test("indeterminate persistence warns about completion and unsafe retries", async () => {
        const agent = registerAgent();
        agent.sendMessage.mockRejectedValue(new DraxAgentError({
            code: "SESSION_PERSISTENCE_INDETERMINATE", statusCode: 500, stage: "persistence",
            message: "Persistence could not be confirmed.", correlationId: "persist-correlation", sessionId: "canonical-session",
        }));
        const app = await server();
        const response = await app.inject({method: "POST", url: `${prefix}/message`, payload: {message: "hello"}});
        expect(response.statusCode).toBe(500);
        expect(response.json()).toMatchObject({correlationId: "persist-correlation", sessionId: "canonical-session", error: {
            code: "SESSION_PERSISTENCE_INDETERMINATE", stage: "persistence", operationMayHaveCompleted: true,
        }});
        expect(response.json().message).toContain("Do not retry");
        expect(response.json().error.message).toBe(response.json().message);
    });

    test("first-turn tools plus failed persistence return the canonical id and block replay without leaking it on denial", async () => {
        let record: any;
        const service = {
            findBy: vi.fn(async (_field: string, id: string) => record?.sessionId === id ? [structuredClone(record)] : []),
            create: vi.fn(async (data: any) => { record = {_id: "record", ...structuredClone(data)}; return structuredClone(record); }),
            findById: vi.fn(async () => structuredClone(record)),
            updatePartial: vi.fn(async () => { throw new Error("PRIVATE persistence details"); }),
        };
        const execute = vi.fn(async () => ({completed: true}));
        const prompt = vi.fn(async (input: any) => {
            await input.tools[0].execute({});
            return {output: "done", tokens: 3, inputTokens: 2, outputTokens: 1, time: 1};
        });
        const agent = new DraxAgent("manual").configure({provider: {prompt}, sessionService: service as any,
            tools: [{name: "side-effect", description: "side effect", parameters: {}, execute}]});
        factory.registry.set(agent.identifier, agent);
        let auth = rbac();
        const app = await server(() => auth);
        const first = await app.inject({method: "POST", url: `${prefix}/message`, payload: {message: "first"}});
        expect(first.statusCode).toBe(500);
        const failure = first.json();
        expect(failure).toMatchObject({sessionId: record.sessionId, correlationId: expect.any(String), error: {
            code: "SESSION_PERSISTENCE_INDETERMINATE", stage: "persistence", operationMayHaveCompleted: true,
        }});
        expect(failure.sessionId).toMatch(/^[0-9a-f-]{36}$/);
        expect(first.body).not.toContain("PRIVATE");
        agent.clearSessions();
        for (const endpoint of ["session", "message"]) {
            const blocked = await app.inject({method: "POST", url: `${prefix}/${endpoint}`,
                payload: {message: "must not replay", sessionId: failure.sessionId}});
            expect(blocked.statusCode).toBe(500);
            expect(blocked.json()).toMatchObject({sessionId: failure.sessionId,
                error: {code: "SESSION_PERSISTENCE_INDETERMINATE", operationMayHaveCompleted: true}});
        }
        auth = {...rbac(), userId: "other-user"};
        const denied = await app.inject({method: "POST", url: `${prefix}/message`,
            payload: {message: "denied", sessionId: failure.sessionId}});
        expect(denied.statusCode).toBe(403);
        expect(denied.json().error.code).toBe("SESSION_ACCESS_DENIED");
        expect(denied.json()).not.toHaveProperty("sessionId");
        expect(denied.body).not.toContain(failure.sessionId);
        expect(prompt).toHaveBeenCalledOnce();
        expect(execute).toHaveBeenCalledOnce();
        expect(service.create).toHaveBeenCalledOnce();
        expect(service.updatePartial).toHaveBeenCalledOnce();
    });

    test.each([true, false, undefined])("serializes explicit operationMayHaveCompleted=%s on controlled errors", async operationMayHaveCompleted => {
        const agent = registerAgent();
        agent.sendMessage.mockRejectedValue(new DraxAgentError({code: "TURN_FAILED", statusCode: 502,
            message: "Safe failure.", sessionId: "resolved-session", operationMayHaveCompleted}));
        const app = await server();
        const response = await app.inject({method: "POST", url: `${prefix}/message`, payload: {message: "hello"}});
        expect(response.statusCode).toBe(502);
        expect(response.json()).toEqual({message: "Safe failure.", sessionId: "resolved-session", error: {
            code: "TURN_FAILED", message: "Safe failure.",
            ...(operationMayHaveCompleted !== undefined ? {operationMayHaveCompleted} : {}),
        }});
    });

    test.each(["AGENT_ACCESS_DENIED", "SESSION_ACCESS_DENIED"])("never discloses a sessionId on %s, even if attached to the error", async code => {
        const agent = registerAgent();
        const error = new DraxAgentError({code, statusCode: 403, message: "Access denied.", sessionId: "private-session"});
        agent.startSession.mockRejectedValue(error);
        agent.sendMessage.mockRejectedValue(error);
        const app = await server();
        for (const endpoint of ["session", "message"]) {
            const response = await app.inject({method: "POST", url: `${prefix}/${endpoint}`,
                payload: {message: "hello", sessionId: "private-session"}});
            expect(response.statusCode).toBe(403);
            expect(response.json()).toEqual({message: "Access denied.", error: {code, message: "Access denied."}});
            expect(response.body).not.toContain("private-session");
        }
    });

    test("validation errors never echo prompt content or schema details", async () => {
        const agent = registerAgent();
        const app = await server();
        const response = await app.inject({method: "POST", url: `${prefix}/message`, payload: {
            message: {secret: "PRIVATE PROMPT"}, userContent: [{type: "PRIVATE PROMPT"}], systemPrompt: "PRIVATE PROMPT",
        }});
        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({message: "Drax agent validation error"});
        expect(response.body).not.toMatch(/PRIVATE|userContent|expected|issues/);
        expect(agent.sendMessage).not.toHaveBeenCalled();
    });
});
