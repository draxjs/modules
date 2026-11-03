import {randomUUID} from "node:crypto";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";
import {DraxAgent} from "../src/agents/DraxAgent.js";
import {DraxAgentError} from "../src/agents/DraxAgentError.js";
import {DraxAgentRouter, DraxAgentRoutingDecisionSchema} from "../src/agents/DraxAgentRouter.js";
import {DraxAgentFactory} from "../src/factory/DraxAgentFactory.js";
import type {DraxAgentRoutingDecision} from "../src/agents/DraxAgentRouter.js";
import type {DraxAgentRouterConfig} from "../src/interfaces/IDraxAgentRouter.js";
import type {
    DraxAgentAccessContext, DraxAgentConfig, DraxAgentMessageInput,
    DraxAgentPromptContext, DraxAgentSessionMessage,
} from "../src/interfaces/IDraxAgent.js";
import type {
    IPromptAudioResponse, IPromptParams, IPromptResponse, IPromptTool,
} from "../src/interfaces/IAIProvider.js";
import type {IAgentSession, IAgentSessionBase} from "../src/interfaces/IAgentSession.js";

const boundaries = vi.hoisted(() => ({
    provider: vi.fn(() => { throw new Error("Unexpected real AI provider factory access"); }),
    persistence: vi.fn(() => { throw new Error("Unexpected real persistence factory access"); }),
    audio: vi.fn<(input: IPromptParams, output: unknown) => Promise<IPromptAudioResponse | undefined>>(),
}));

// Keep the real registry/router/core; importing these factories must not load DBs, SDKs or TTS.
vi.mock("../src/factory/ai/AiProviderFactory.js", () => ({default: {instance: boundaries.provider}}));
vi.mock("../src/factory/services/AgentSessionServiceFactory.js", () => ({
    default: {get instance() { return boundaries.persistence(); }},
}));
vi.mock("../src/services/PromptAudioService.js", () => ({default: {build: boundaries.audio}}));

const accessContext: DraxAgentAccessContext = {
    userId: "user", tenantId: "tenant", authenticated: true, permissions: ["tasks:write"],
};
const specialistResponse: IPromptResponse = {output: "Respuesta final", tokens: 7, inputTokens: 5, outputTokens: 2, time: 999};
const audio: IPromptAudioResponse = {
    audio: "YXVkaW8=", contentType: "audio/mpeg", encoding: "base64",
    meta: {provider: "mock", model: "mock-tts", voiceId: "voice", size: 5, time: 3},
};

function provider(response: IPromptResponse = specialistResponse) {
    return {prompt: vi.fn<(input: IPromptParams) => Promise<IPromptResponse>>()
        .mockImplementation(async () => structuredClone(response))};
}

function decision(agentIdentifier: string): DraxAgentRoutingDecision {
    return {action: "delegate", agentIdentifier, message: null, requiresMultipleSpecialists: false};
}

function classified(output: unknown): IPromptResponse {
    return {output, tokens: 5, inputTokens: 3, outputTokens: 2, time: 888};
}

function specialist(config: DraxAgentConfig = {}, description = "Gestiona tareas") {
    return DraxAgentFactory.register(new DraxAgent(randomUUID(), description).configure({
        provider: provider(), sessionService: false,
        routing: {eligible: true, enabled: true, capabilities: "Buscar y crear tareas", examples: ["Buscá mi tarea"]},
        ...config,
    }));
}

function router(candidates: DraxAgent[], config: DraxAgentRouterConfig = {}) {
    return DraxAgentFactory.register(new DraxAgentRouter(randomUUID(), "Router de pruebas").configure({
        sessionService: false, candidateIdentifiers: candidates.map(agent => agent.identifier), ...config,
    }));
}

function fixture(config: DraxAgentRouterConfig = {}, specialistConfig: DraxAgentConfig = {}) {
    const execution = provider();
    const target = specialist({provider: execution, ...specialistConfig});
    const routing = provider(classified(decision(target.identifier)));
    const agent = router([target], {routingProvider: routing, routingModel: "routing-model", ...config});
    return {agent, target, routing, execution};
}

function context(messages: DraxAgentSessionMessage[] = []): DraxAgentPromptContext {
    return {session: {
        id: randomUUID(), userId: accessContext.userId, tenantId: accessContext.tenantId,
        messages: structuredClone(messages), createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-02"),
    }};
}

function input(overrides: Partial<DraxAgentMessageInput> = {}): DraxAgentMessageInput {
    return {message: "Creá mi tarea, sin reformular este pedido", userId: "user", tenantId: "tenant", accessContext, ...overrides};
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(done => { resolve = done; });
    return {promise, resolve};
}

function persistence() {
    const records = new Map<string, IAgentSession>();
    const service = {
        create: vi.fn(async (data: IAgentSessionBase) => {
            const record = {_id: randomUUID(), ...structuredClone(data)};
            records.set(record._id, record);
            return structuredClone(record);
        }),
        findBy: vi.fn(async (_field: string, id: string, limit: number) =>
            structuredClone([...records.values()].filter(record => record.sessionId === id).slice(0, limit))),
        findById: vi.fn(async (id: string) => structuredClone(records.get(id) ?? null)),
        updatePartial: vi.fn(async (id: string, data: IAgentSessionBase) => {
            const previous = records.get(id);
            if (!previous) throw new Error("Missing in-memory session");
            const record = {...previous, ...structuredClone(data)};
            records.set(id, record);
            return structuredClone(record);
        }),
    };
    return {records, service: service as typeof service & Exclude<DraxAgentConfig["sessionService"], false | undefined>};
}

beforeEach(() => {
    boundaries.provider.mockClear();
    boundaries.persistence.mockClear();
    boundaries.audio.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    // A swallowed boundary error must still fail the test, not masquerade as an expected router failure.
    expect(boundaries.provider).not.toHaveBeenCalled();
    expect(boundaries.persistence).not.toHaveBeenCalled();
});

describe("DraxAgentRouter configuration and factory", () => {
    test("register is identity-idempotent, rejects replacements and keeps registry snapshots detached", () => {
        const original = specialist();
        expect(DraxAgentFactory.register(original)).toBe(original);
        expect(DraxAgentFactory.lookup(original.identifier)).toBe(original);
        expect(() => DraxAgentFactory.register(new DraxAgent(original.identifier))).toThrow(/already registered/);
        expect(() => DraxAgentFactory.register(new DraxAgentRouter(original.identifier))).toThrow(/already registered/);
        const snapshot = DraxAgentFactory.agents();
        snapshot.length = 0;
        expect(DraxAgentFactory.agents()).toContain(original);
        expect(DraxAgentFactory.lookup(original.identifier)).toBe(original);
    });

    test("register rejects empty identifiers without adding them", () => {
        const before = DraxAgentFactory.agents();
        expect(() => DraxAgentFactory.register(new DraxAgent(""))).toThrow(/empty/);
        expect(() => DraxAgentFactory.register(new DraxAgent("  \t"))).toThrow(/empty/);
        expect(DraxAgentFactory.agents()).toEqual(before);
    });

    test("lookup is non-creating while legacy instance remains get-or-create", () => {
        const identifier = randomUUID();
        const before = DraxAgentFactory.agents();
        expect(DraxAgentFactory.lookup(identifier)).toBeUndefined();
        expect(DraxAgentFactory.agents()).toEqual(before);
        const manual = DraxAgentFactory.instance(identifier, "Manual");
        expect(manual.type).toBe("specialist");
        expect(DraxAgentFactory.instance(identifier, "Ignored")).toBe(manual);
        expect(manual.description).toBe("Manual");
    });

    test("router helper creates/reconfigures the same router without changing its type or description", async () => {
        const identifier = randomUUID();
        const routing = provider(classified({action: "clarify", agentIdentifier: null, message: "¿Qué tarea?", requiresMultipleSpecialists: false}));
        const target = specialist();
        const agent = DraxAgentFactory.router(identifier, "Principal", {
            routingProvider: routing, candidateIdentifiers: [target.identifier], sessionService: false,
        });
        expect(agent).toBeInstanceOf(DraxAgentRouter);
        expect(agent.type).toBe("router");
        expect(DraxAgentFactory.router(identifier, "Principal", {routingModel: "updated-model"})).toBe(agent);
        expect(DraxAgentFactory.router(identifier)).toBe(agent);
        expect(DraxAgentFactory.instance(identifier)).toBe(agent);
        await agent.executeTurn(input(), context());
        expect(routing.prompt).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({model: "updated-model"}));
        expect(() => DraxAgentFactory.router(identifier, "Different")).toThrow(/collision/);
        expect(() => DraxAgentFactory.register(new DraxAgent(identifier))).toThrow(/already registered/);
        expect(agent.description).toBe("Principal");
    });

    test("router helper refuses specialist collisions and does not register invalid routers", () => {
        const manual = specialist();
        expect(() => DraxAgentFactory.router(manual.identifier)).toThrow(/collision/);
        expect(DraxAgentFactory.lookup(manual.identifier)).toBe(manual);
        const identifier = randomUUID();
        expect(() => DraxAgentFactory.router(identifier, "", {tools: () => []})).toThrow(/tools/);
        expect(DraxAgentFactory.lookup(identifier)).toBeUndefined();
    });

    test("rejects static and lazy business tools/builders, including inherited setters", () => {
        const agent = router([]);
        const tool: IPromptTool = {name: "write", description: "write", execute: vi.fn()};
        const builder = {getTools: vi.fn(() => [tool]), getSystemPromptSection: vi.fn(() => "PRIVATE")};
        const lazyTools = vi.fn(() => [tool]);
        const lazyBuilders = vi.fn(() => [builder]);
        expect(() => agent.configure({tools: [tool]})).toThrow(/tools/);
        expect(() => agent.setTools(lazyTools)).toThrow(/tools/);
        expect(() => agent.configure({toolBuilders: [builder]})).toThrow(/tools/);
        expect(() => agent.setToolBuilders(lazyBuilders)).toThrow(/tools/);
        expect(agent.configure({tools: [], toolBuilders: []})).toBe(agent);
        expect(lazyTools).not.toHaveBeenCalled();
        expect(lazyBuilders).not.toHaveBeenCalled();
        expect(builder.getTools).not.toHaveBeenCalled();
    });

    test.each(["routingHistoryLimit", "specialistHistoryLimit"] as const)("validates %s boundaries", key => {
        const agent = router([]);
        for (const limit of [-1, 1.5, 101, NaN, Infinity]) {
            expect(() => agent.configure({[key]: limit})).toThrow(/integers between 0 and 100/);
        }
        for (const limit of [0, 1, 100]) expect(agent.configure({[key]: limit})).toBe(agent);
    });
});

describe("DraxAgentRouter public catalog and access", () => {
    test("catalog reads only metadata: no builders, tool sources, prompts or providers are evaluated or leaked", async () => {
        const systemPrompt = vi.fn(() => "PRIVATE_SYSTEM_PROMPT");
        const tools = vi.fn(() => []);
        const builders = vi.fn(() => []);
        const execution = provider();
        const target = specialist({systemPrompt, tools, toolBuilders: builders, provider: execution});
        const routing = provider(classified({action: "clarify", agentIdentifier: null, message: "¿Qué necesitás?", requiresMultipleSpecialists: false}));
        const agent = router([target], {routingProvider: routing, systemPrompt: "PRIVATE_ROUTER_PROMPT"});
        const expected = [{identifier: target.identifier, description: "Gestiona tareas", capabilities: "Buscar y crear tareas", examples: ["Buscá mi tarea"]}];
        expect(await agent.buildCatalog(accessContext)).toEqual(expected);
        await agent.executeTurn(input(), context());
        const request = routing.prompt.mock.calls[0][0];
        expect(JSON.parse(request.userInput!).catalog).toEqual(expected);
        expect(JSON.stringify(request)).not.toContain("PRIVATE_");
        expect(systemPrompt).not.toHaveBeenCalled();
        expect(tools).not.toHaveBeenCalled();
        expect(builders).not.toHaveBeenCalled();
        expect(execution.prompt).not.toHaveBeenCalled();
    });

    test("catalog intersects allowlist, specialist type, opt-in, enabled, capabilities and trusted authorization", async () => {
        const allowed = specialist({access: {requireUser: true, requireTenant: true, permissions: ["tasks:write"]}});
        const notEligible = specialist({routing: {capabilities: "No opt-in"}});
        const disabled = specialist({routing: {eligible: true, enabled: false, capabilities: "Disabled"}});
        const blank = specialist({routing: {eligible: true, capabilities: "  "}});
        const denied = specialist({access: {authorize: async () => false}});
        const throwing = specialist({access: {authorize: () => { throw new Error("PRIVATE_AUTH"); }}});
        const outside = specialist();
        const otherRouter = router([], {routing: {eligible: true, capabilities: "Not a specialist"}});
        const candidates = [allowed, notEligible, disabled, blank, denied, throwing, otherRouter];
        const agent = router(candidates, {routing: {eligible: true, capabilities: "Self"}});
        agent.configure({candidateIdentifiers: [...candidates.map(value => value.identifier), agent.identifier]});
        expect((await agent.buildCatalog(accessContext)).map(entry => entry.identifier)).toEqual([allowed.identifier]);
        expect(await agent.buildCatalog()).toEqual([]);
        expect(await agent.buildCatalog({...accessContext, permissions: []})).toEqual([]);
        expect(await agent.buildCatalog({...accessContext, authenticated: false})).toEqual([]);
        expect((await agent.buildCatalog(accessContext)).some(entry => entry.identifier === outside.identifier)).toBe(false);
        agent.configure({candidateIdentifiers: []});
        expect(await agent.buildCatalog(accessContext)).toEqual([]);
    });

    test("catalog bounds public metadata and returns detached entries", async () => {
        const target = specialist({routing: {
            eligible: true, capabilities: "c".repeat(2100), examples: Array.from({length: 8}, () => "e".repeat(350)),
        }}, "d".repeat(550));
        const agent = router([target]);
        const catalog = await agent.buildCatalog();
        expect(catalog).toEqual([{
            identifier: target.identifier, description: "d".repeat(500), capabilities: "c".repeat(2000),
            examples: Array.from({length: 6}, () => "e".repeat(300)),
        }]);
        catalog[0].examples![0] = "mutated";
        catalog[0].capabilities = "mutated";
        expect((await agent.buildCatalog())[0].capabilities).toHaveLength(2000);
        expect(target.routing!.examples![0]).toHaveLength(350);
    });

    test.each(["access", "enabled", "eligible"] as const)("revalidates %s after classification before any specialist work", async change => {
        let authorized = true;
        const {agent, target, routing, execution} = fixture({}, {access: {authorize: () => authorized}});
        routing.prompt.mockImplementationOnce(async () => {
            if (change === "access") authorized = false;
            else target.configure({routing: {...target.routing, [change]: false}});
            return classified(decision(target.identifier));
        });
        const result = await agent.executeTurn(input(), context());
        expect(result.error).toMatchObject({code: "ROUTING_TARGET_DENIED", stage: "access", statusCode: 403});
        expect(result.resolvedAgentIdentifier).toBeUndefined();
        expect(execution.prompt).not.toHaveBeenCalled();
        expect(routing.prompt).toHaveBeenCalledTimes(1);
    });

    test("a specialist access denial at executeTurn is a 403 result, not an indeterminate execution or fallback", async () => {
        let checks = 0;
        const authorize = vi.fn(() => ++checks < 3);
        const {agent, execution} = fixture({}, {access: {authorize}});
        const result = await agent.executeTurn(input(), context());
        expect(authorize).toHaveBeenCalledTimes(3);
        expect(result.error).toMatchObject({code: "ROUTING_TARGET_DENIED", stage: "access", statusCode: 403, operationMayHaveCompleted: false});
        expect(result.resolvedAgentIdentifier).toBeUndefined();
        expect(execution.prompt).not.toHaveBeenCalled();
    });

    test("router access is enforced before classification and before opening a session", async () => {
        const {agent, routing, execution} = fixture({access: {permissions: ["router:use"]}});
        await expect(agent.executeTurn(input(), context())).rejects.toMatchObject({code: "AGENT_ACCESS_DENIED", statusCode: 403});
        await expect(agent.sendMessage(input())).rejects.toMatchObject({code: "AGENT_ACCESS_DENIED", statusCode: 403});
        expect(routing.prompt).not.toHaveBeenCalled();
        expect(execution.prompt).not.toHaveBeenCalled();
    });
});

describe("DraxAgentRouter classification decisions", () => {
    test.each(["object", "JSON string"])("accepts a valid %s decision and delegates exactly once", async format => {
        const {agent, target, routing, execution} = fixture();
        const output = decision(target.identifier);
        routing.prompt.mockResolvedValueOnce(classified(format === "object" ? output : JSON.stringify(output)));
        const execute = vi.spyOn(target, "executeTurn");
        const send = vi.spyOn(target, "sendMessage");
        const result = await agent.executeTurn(input(), context());
        expect(result).toMatchObject({message: "Respuesta final", output: "Respuesta final", resolvedAgentIdentifier: target.identifier});
        expect(result.error).toBeUndefined();
        expect(execute).toHaveBeenCalledTimes(1);
        expect(execution.prompt).toHaveBeenCalledTimes(1);
        expect(send).not.toHaveBeenCalled();
    });

    test.each([
        ["malformed JSON", "{not-json"],
        ["fenced JSON", '```json\n{"action":"delegate"}\n```'],
        ["null", null],
        ["array", []],
        ["missing nullable fields", {action: "clarify", requiresMultipleSpecialists: false}],
        ["missing required multiple flag", {action: "clarify", agentIdentifier: null, message: "¿Qué tarea?"}],
        ["wrong multiple flag type", {action: "clarify", agentIdentifier: null, message: "¿Qué tarea?", requiresMultipleSpecialists: "false"}],
        ["unknown action", {action: "transfer", agentIdentifier: null, message: "No", requiresMultipleSpecialists: false}],
        ["unknown extra property", {action: "clarify", agentIdentifier: null, message: "¿Qué tarea?", requiresMultipleSpecialists: false, reasoning: "PRIVATE"}],
        ["delegate without identifier", {action: "delegate", agentIdentifier: null, message: null, requiresMultipleSpecialists: false}],
        ["delegate with message", {action: "delegate", agentIdentifier: "candidate", message: "Rewritten", requiresMultipleSpecialists: false}],
        ["empty identifier", {action: "delegate", agentIdentifier: "", message: null, requiresMultipleSpecialists: false}],
        ["clarify with identifier", {action: "clarify", agentIdentifier: "candidate", message: "¿Qué tarea?", requiresMultipleSpecialists: false}],
        ["unsupported without message", {action: "unsupported", agentIdentifier: null, message: null, requiresMultipleSpecialists: false}],
        ["blank message", {action: "clarify", agentIdentifier: null, message: "  ", requiresMultipleSpecialists: false}],
        ["oversized message", {action: "unsupported", agentIdentifier: null, message: "x".repeat(601), requiresMultipleSpecialists: false}],
    ])("rejects %s without executing, retrying or exposing classification", async (_name, output) => {
        const {agent, routing, execution} = fixture();
        routing.prompt.mockResolvedValueOnce(classified(output));
        const result = await agent.executeTurn(input(), context());
        expect(result.error).toMatchObject({code: "ROUTING_DECISION_INVALID", statusCode: 502, stage: "routing"});
        expect(result.output).toBe(result.message);
        expect(result.message).not.toContain("PRIVATE");
        expect(result.resolvedAgentIdentifier).toBeUndefined();
        expect(routing.prompt).toHaveBeenCalledTimes(1);
        expect(execution.prompt).not.toHaveBeenCalled();
    });

    test("provider receives the strict required-nullable decision schema", async () => {
        const {agent, target, routing} = fixture();
        await agent.executeTurn(input(), context());
        const schema = routing.prompt.mock.calls[0][0].zodSchema!;
        expect(schema).toBe(DraxAgentRoutingDecisionSchema);
        expect(schema.safeParse(decision(target.identifier)).success).toBe(true);
        for (const key of ["action", "agentIdentifier", "message", "requiresMultipleSpecialists"]) {
            const partial: Record<string, unknown> = {...decision(target.identifier)};
            delete partial[key];
            expect(schema.safeParse(partial).success).toBe(false);
        }
        expect(schema.safeParse({...decision(target.identifier), prompt: "secret"}).success).toBe(false);
    });

    test("no authorized candidates returns 503 without classification, provider creation or tools", async () => {
        const {agent, target, routing, execution} = fixture();
        target.configure({access: {authorize: async () => false}});
        const result = await agent.executeTurn(input(), context());
        expect(result.error).toMatchObject({code: "ROUTER_NO_CANDIDATES", stage: "routing", statusCode: 503});
        expect(result).toMatchObject({tokens: 0, inputTokens: 0, outputTokens: 0});
        expect(routing.prompt).not.toHaveBeenCalled();
        expect(execution.prompt).not.toHaveBeenCalled();
    });

    test.each(["clarify", "unsupported"] as const)("%s returns only the public message, with no specialist tools", async action => {
        const write = vi.fn();
        const tools = vi.fn(() => [{name: "write", description: "write", execute: write}]);
        const {agent, routing, execution} = fixture({}, {tools});
        const message = action === "clarify" ? "¿Qué tarea querés crear?" : "No puedo atender ese tema.";
        routing.prompt.mockResolvedValueOnce(classified({action, agentIdentifier: null, message, requiresMultipleSpecialists: false}));
        const result = await agent.executeTurn(input(), context());
        expect(result).toMatchObject({message, output: message, tokens: 5, inputTokens: 3, outputTokens: 2});
        expect(result.error).toBeUndefined();
        expect(result.resolvedAgentIdentifier).toBeUndefined();
        expect(tools).not.toHaveBeenCalled();
        expect(write).not.toHaveBeenCalled();
        expect(execution.prompt).not.toHaveBeenCalled();
    });

    test.each(["delegate", "clarify", "unsupported"] as const)("requiresMultipleSpecialists blocks partial execution for %s", async action => {
        const {agent, target, routing, execution} = fixture();
        const tools = vi.fn(() => []);
        target.configure({tools});
        routing.prompt.mockResolvedValueOnce(classified({
            action, agentIdentifier: action === "delegate" ? target.identifier : null,
            message: action === "delegate" ? null : "No ejecutes parcialmente", requiresMultipleSpecialists: true,
        }));
        const result = await agent.executeTurn(input(), context());
        expect(result.message).toMatch(/varios especialistas/);
        expect(result.message).toMatch(/individuales/);
        expect(result.error).toBeUndefined();
        expect(result.resolvedAgentIdentifier).toBeUndefined();
        expect(tools).not.toHaveBeenCalled();
        expect(execution.prompt).not.toHaveBeenCalled();
    });

    test.each(["unknown", "outside allowlist", "router", "self"])("denies a %s target using non-creating lookup, never recursion", async kind => {
        const {agent, routing, execution} = fixture();
        const outsideProvider = provider();
        const outside = specialist({provider: outsideProvider});
        const nested = router([], {routingProvider: provider()});
        const nestedExecute = vi.spyOn(nested, "executeTurn");
        const targetId = kind === "unknown" ? randomUUID() : kind === "router" ? nested.identifier : kind === "self" ? agent.identifier : outside.identifier;
        const before = DraxAgentFactory.agents();
        const create = vi.spyOn(DraxAgentFactory, "instance");
        routing.prompt.mockResolvedValueOnce(classified(decision(targetId)));
        const result = await agent.executeTurn(input(), context());
        expect(result.error).toMatchObject({code: "ROUTING_TARGET_DENIED", statusCode: 403, stage: "access"});
        expect(create).not.toHaveBeenCalled();
        expect(DraxAgentFactory.agents()).toEqual(before);
        if (kind === "unknown") expect(DraxAgentFactory.lookup(targetId)).toBeUndefined();
        expect(nestedExecute).not.toHaveBeenCalled();
        expect(outsideProvider.prompt).not.toHaveBeenCalled();
        expect(execution.prompt).not.toHaveBeenCalled();
        expect(routing.prompt).toHaveBeenCalledTimes(1);
    });
});

describe("DraxAgentRouter delegation boundaries and usage", () => {
    test("isolates routing/specialist providers, models, prompts and tools, preserving the original request", async () => {
        const selectedWrite = vi.fn(async () => ({id: "task-id"}));
        const otherWrite = vi.fn();
        const otherProvider = provider();
        const other = specialist({provider: otherProvider, systemPrompt: "OTHER_PRIVATE_PROMPT", tools: [{name: "other", description: "other", execute: otherWrite}]});
        const builder = {
            getTools: vi.fn(() => [{name: "selected", description: "write", execute: selectedWrite}]),
            getSystemPromptSection: vi.fn(() => "SELECTED_PRIVATE_TOOLS"),
        };
        const builders = vi.fn(() => [builder]);
        const {agent, target, routing, execution} = fixture({model: "router-default", systemPrompt: "ROUTER_PRIVATE_PROMPT"}, {
            model: "specialist-model", systemPrompt: "SELECTED_PRIVATE_PROMPT", toolBuilders: builders,
        });
        agent.configure({candidateIdentifiers: [target.identifier, other.identifier]});
        execution.prompt.mockImplementationOnce(async request => {
            expect(request.tools!.map(tool => tool.name)).toEqual(["selected"]);
            await request.tools![0].execute({title: "Original"});
            return structuredClone(specialistResponse);
        });
        const original = input({model: "unrelated-request-model"});
        const result = await agent.executeTurn(original, context());
        const routingRequest = routing.prompt.mock.calls[0][0];
        expect(routingRequest).toMatchObject({model: "routing-model", tools: [], audioResponse: false});
        expect(JSON.parse(routingRequest.userInput!).message).toBe(original.message);
        expect(JSON.stringify(routingRequest)).not.toContain("PRIVATE_");
        const specialistRequest = execution.prompt.mock.calls[0][0];
        expect(specialistRequest).toMatchObject({model: "specialist-model", userInput: original.message});
        expect(specialistRequest.systemPrompt).toContain("SELECTED_PRIVATE_PROMPT");
        expect(specialistRequest.systemPrompt).toContain("SELECTED_PRIVATE_TOOLS");
        expect(specialistRequest.systemPrompt).not.toContain("ROUTER_PRIVATE_PROMPT");
        expect(specialistRequest.systemPrompt).not.toContain("OTHER_PRIVATE_PROMPT");
        expect(builders).toHaveBeenCalledTimes(1);
        expect(builder.getTools).toHaveBeenCalledTimes(1);
        expect(selectedWrite).toHaveBeenCalledExactlyOnceWith({title: "Original"});
        expect(otherWrite).not.toHaveBeenCalled();
        expect(otherProvider.prompt).not.toHaveBeenCalled();
        expect(result.message).toBe("Respuesta final");
    });

    test("preserves images, content, file descriptors, memory, KB, audio and tool navigation only for the specialist", async () => {
        const navigate = vi.fn(async () => ({id: "task-42"}));
        const {agent, routing, execution} = fixture({}, {tools: [{
            name: "task_findOne", description: "Find", execute: navigate,
            navigation: {entityName: "task", method: "findOne"},
        }]});
        execution.prompt.mockImplementationOnce(async request => {
            await request.tools![0].execute({});
            return {...structuredClone(specialistResponse), audio: structuredClone(audio)};
        });
        const original = input({
            message: "Mirá ![imagen](data:image/png;base64,PRIVATE_IMAGE) y buscá mi tarea",
            userImages: [{url: "data:image/png;base64,PRIVATE_IMAGE", detail: "high"}],
            userContent: [{type: "text", text: "Texto extra"}, {type: "image", imageUrl: "data:image/png;base64,PRIVATE_PART", detail: "low"}],
            inputFiles: [{filename: "private.pdf", filepath: "/private/file.pdf", url: "https://invalid.test/private", mimetype: "application/pdf", size: 42}],
            memory: [{key: "private-memory", value: "PRIVATE_MEMORY"}], memoryHeader: "MEMORY_HEADER",
            knowledgeBase: ["PRIVATE_KB"], knowledgeBaseHeader: "KB_HEADER", toolMaxIterations: 4,
            audioResponse: {provider: "mock", voiceId: "voice", voiceSettings: {stability: 0.5}},
        });
        boundaries.audio.mockResolvedValueOnce(structuredClone(audio));
        const before = structuredClone(original);
        const result = await agent.executeTurn(original, context());
        expect(execution.prompt.mock.calls[0][0]).toMatchObject({
            userInput: original.message, userImages: original.userImages, userContent: original.userContent, inputFiles: original.inputFiles,
            memory: original.memory, memoryHeader: "MEMORY_HEADER", knowledgeBase: original.knowledgeBase,
            knowledgeBaseHeader: "KB_HEADER", toolMaxIterations: 4, audioResponse: false,
        });
        const routingRequest = routing.prompt.mock.calls[0][0];
        expect(JSON.parse(routingRequest.userInput!)).toMatchObject({
            message: "Mirá ![imagen]([adjunto]) y buscá mi tarea", additionalText: ["Texto extra"],
            attachments: {images: 2, files: [{mimetype: "application/pdf", size: 42}]},
        });
        for (const key of ["memory", "knowledgeBase", "userImages", "userContent", "inputFiles"]) expect(routingRequest).not.toHaveProperty(key);
        expect(JSON.stringify(routingRequest)).not.toContain("PRIVATE_");
        expect(JSON.stringify(routingRequest)).not.toContain("private.pdf");
        expect(result).toMatchObject({navigationPath: "/crud/task?mode=view&id=task-42", audio});
        expect(boundaries.audio).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({audioResponse: original.audioResponse}), result.message);
        expect(original).toEqual(before);
    });

    test("classification retains supplemental text in restored history without sending its images", async () => {
        const {agent, routing} = fixture();
        await agent.executeTurn(input(), context([{
            role: "user", content: "Revisá el adjunto",
            userContent: [
                {type: "text", text: "Revisá el adjunto"},
                {type: "text", text: "Es una consulta sobre países"},
                {type: "image", imageUrl: "data:image/png;base64,PRIVATE_HISTORY_IMAGE"},
            ],
        }]));
        expect(routing.prompt.mock.calls[0][0].history).toEqual([{
            role: "user", content: "Revisá el adjunto\nEs una consulta sobre países",
        }]);
        expect(JSON.stringify(routing.prompt.mock.calls[0][0])).not.toContain("PRIVATE_HISTORY_IMAGE");
    });

    test("executeTurn never creates, restores, caches or persists sessions in either router or specialist", async () => {
        const storage = persistence();
        const {agent, target} = fixture({sessionService: storage.service}, {sessionService: storage.service});
        const ctx = context([{role: "user", content: "Anterior"}, {role: "assistant", content: "Respuesta anterior"}]);
        const original = input({sessionId: ctx.session.id, correlationId: "backend-correlation"});
        const beforeInput = structuredClone(original);
        const beforeContext = structuredClone(ctx);
        const send = vi.spyOn(target, "sendMessage");
        const result = await agent.executeTurn(original, ctx);
        expect(result.correlationId).toBe("backend-correlation");
        expect(result).not.toHaveProperty("sessionId");
        expect(result).not.toHaveProperty("agentIdentifier");
        expect(original).toEqual(beforeInput);
        expect(ctx).toEqual(beforeContext);
        expect(agent.getSession({sessionId: ctx.session.id, userId: "user", tenantId: "tenant"})).toBeNull();
        expect(target.getSession({sessionId: ctx.session.id, userId: "user", tenantId: "tenant"})).toBeNull();
        expect(send).not.toHaveBeenCalled();
        for (const method of Object.values(storage.service)) expect(method).not.toHaveBeenCalled();
        expect(storage.records.size).toBe(0);
    });

    test("provider mutation cannot alter caller input/context or contaminate delegated history", async () => {
        const {agent, target, routing, execution} = fixture();
        const ctx = context([{role: "user", content: "Original history"}]);
        const original = input({memory: [{key: "key", value: "original-memory"}]});
        const beforeInput = structuredClone(original);
        const beforeContext = structuredClone(ctx);
        routing.prompt.mockImplementationOnce(async request => {
            request.history![0].content = "routing mutation";
            return classified(decision(target.identifier));
        });
        execution.prompt.mockImplementationOnce(async request => {
            expect(request.history).toEqual([{role: "user", content: "Original history"}]);
            request.history![0].content = "specialist mutation";
            request.memory![0].value = "mutated";
            return structuredClone(specialistResponse);
        });
        await agent.executeTurn(original, ctx);
        expect(original).toEqual(beforeInput);
        expect(ctx).toEqual(beforeContext);
    });

    test.each([0, 2])("applies independent bounded histories (specialist limit %i) and strips legacy system messages", async specialistHistoryLimit => {
        const {agent, routing, execution} = fixture({routingHistoryLimit: 1, specialistHistoryLimit});
        const messages: DraxAgentSessionMessage[] = [
            {role: "system", content: "LEGACY_PRIVATE_SYSTEM"},
            {role: "user", content: [{type: "text", text: "Mirá data:image/png;base64,PRIVATE_HISTORY"}, {type: "image", imageUrl: "PRIVATE_HISTORY_IMAGE"}]},
            {role: "system", content: "ANOTHER_PRIVATE_SYSTEM"},
            {role: "assistant", content: "Respuesta previa"},
        ];
        await agent.executeTurn(input(), context(messages));
        expect(routing.prompt.mock.calls[0][0].history).toEqual([{role: "assistant", content: "Respuesta previa"}]);
        expect(execution.prompt.mock.calls[0][0].history).toEqual(specialistHistoryLimit === 0 ? [] : [
            {role: "user", content: messages[1].content}, {role: "assistant", content: "Respuesta previa"},
        ]);
        expect(JSON.stringify(routing.prompt.mock.calls[0][0])).not.toContain("PRIVATE_HISTORY");
    });

    test("classification history is text-only, redacted and bounded without altering specialist multimodal history", async () => {
        const {agent, routing, execution} = fixture();
        const ctx = context([{role: "user", content: [
            {type: "text", text: "Describí data:image/png;base64,PRIVATE_HISTORY " + "x".repeat(4100)},
            {type: "image", imageUrl: "data:image/png;base64,PRIVATE_BINARY"},
        ]}]);
        await agent.executeTurn(input(), ctx);
        const history = routing.prompt.mock.calls[0][0].history!;
        expect(history[0].content).toBe(("Describí [adjunto] " + "x".repeat(4100)).slice(0, 4000));
        expect(JSON.stringify(history)).not.toContain("PRIVATE_");
        expect(execution.prompt.mock.calls[0][0].history).toEqual([{role: "user", content: ctx.session.messages[0].content}]);
    });

    test("sums routing/execution tokens and measures elapsed time with shared correlation/operation metadata", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
        const {agent, target, routing, execution} = fixture();
        routing.prompt.mockImplementationOnce(async () => {
            vi.advanceTimersByTime(11);
            return classified(decision(target.identifier));
        });
        execution.prompt.mockImplementationOnce(async () => {
            vi.advanceTimersByTime(17);
            return structuredClone(specialistResponse);
        });
        const result = await agent.executeTurn(input({correlationId: "correlation", ip: "127.0.0.1", userAgent: "test-agent"}), context());
        expect(result).toMatchObject({
            tokens: 12, inputTokens: 8, outputTokens: 4, time: 28, correlationId: "correlation",
            metrics: {routingTime: 11, executionTime: 17, totalTime: 28,
                routingTokens: 5, routingInputTokens: 3, routingOutputTokens: 2,
                executionTokens: 7, executionInputTokens: 5, executionOutputTokens: 2},
        });
        expect(routing.prompt.mock.calls[0][0]).toMatchObject({
            operationTitle: "drax-agent-router:correlation:routing", operationGroup: "drax-agent-router",
            ip: "127.0.0.1", userAgent: "test-agent", user: "user", tenant: "tenant",
        });
        expect(execution.prompt.mock.calls[0][0]).toMatchObject({
            operationTitle: "drax-agent-router:correlation:specialist", operationGroup: "drax-agent-router",
            ip: "127.0.0.1", userAgent: "test-agent", user: "user", tenant: "tenant",
        });
    });

    test("normalizes non-finite usage without allowing NaN to corrupt router totals", async () => {
        const {agent, routing, execution} = fixture();
        routing.prompt.mockResolvedValueOnce({...classified({action: "clarify", agentIdentifier: null, message: "¿Qué tarea?", requiresMultipleSpecialists: false}), tokens: NaN, inputTokens: Infinity});
        const result = await agent.executeTurn(input(), context());
        expect(result).toMatchObject({tokens: 0, inputTokens: 0, outputTokens: 2});
        expect(result.metrics).toMatchObject({routingTokens: 0, routingInputTokens: 0, routingOutputTokens: 2});
        expect(result.correlationId).toMatch(/^[0-9a-f-]{36}$/);
        expect(execution.prompt).not.toHaveBeenCalled();
    });
});

describe("DraxAgentRouter canonical conversation and in-memory persistence", () => {
    test("continuity is only a signal: follow-up and topic switch use original canonical history without duplicates", async () => {
        const {agent, target, routing, execution} = fixture();
        const secondProvider = provider({...specialistResponse, output: "Respuesta del segundo"});
        const second = specialist({provider: secondProvider});
        agent.configure({candidateIdentifiers: [target.identifier, second.identifier]});
        routing.prompt.mockResolvedValueOnce(classified(decision(target.identifier)))
            .mockResolvedValueOnce(classified(decision(target.identifier)))
            .mockResolvedValueOnce(classified(decision(second.identifier)));
        const first = await agent.sendMessage(input({message: "Primera consulta literal", correlationId: "untrusted-client-id"}));
        const followup = await agent.sendMessage(input({sessionId: first.sessionId, message: "¿Y esa tarea?"}));
        const switched = await agent.sendMessage(input({sessionId: first.sessionId, message: "Ahora otro tema literal"}));
        expect(first.correlationId).not.toBe("untrusted-client-id");
        expect(new Set([first.correlationId, followup.correlationId, switched.correlationId]).size).toBe(3);
        expect(JSON.parse(routing.prompt.mock.calls[0][0].userInput!).lastSpecialist).toBeNull();
        expect(JSON.parse(routing.prompt.mock.calls[1][0].userInput!).lastSpecialist).toBe(target.identifier);
        expect(JSON.parse(routing.prompt.mock.calls[2][0].userInput!).lastSpecialist).toBe(target.identifier);
        const canonical = [
            {role: "user", content: "Primera consulta literal"}, {role: "assistant", content: "Respuesta final"},
            {role: "user", content: "¿Y esa tarea?"}, {role: "assistant", content: "Respuesta final"},
        ];
        expect(execution.prompt.mock.calls[0][0].history).toEqual([]);
        expect(execution.prompt.mock.calls[1][0].history).toEqual(canonical.slice(0, 2));
        expect(secondProvider.prompt.mock.calls[0][0]).toMatchObject({history: canonical, userInput: "Ahora otro tema literal"});
        expect(switched).toMatchObject({agentIdentifier: agent.identifier, sessionId: first.sessionId, resolvedAgentIdentifier: second.identifier});
        const session = agent.getSession(input({sessionId: first.sessionId}))!;
        expect(session).toMatchObject({ownerAgentIdentifier: agent.identifier, conversationType: "router", lastResolvedAgentIdentifier: second.identifier});
        expect(session.messages.map(({role, content}) => ({role, content}))).toEqual([
            ...canonical, {role: "user", content: "Ahora otro tema literal"}, {role: "assistant", content: "Respuesta del segundo"},
        ]);
        expect(session.messages.map(message => message.resolvedAgentIdentifier)).toEqual([
            target.identifier, target.identifier, target.identifier, target.identifier, second.identifier, second.identifier,
        ]);
        for (const result of [first, followup, switched]) {
            expect(session.messages.filter(message => message.correlationId === result.correlationId)).toHaveLength(2);
        }
    });

    test("restores a cleared router cache with owner/resolution/correlation and image/file metadata, then changes specialist", async () => {
        const storage = persistence();
        const specialistStorage = persistence();
        const {agent, target, routing} = fixture({sessionService: storage.service}, {sessionService: specialistStorage.service});
        const nextProvider = provider({...specialistResponse, output: "Nuevo especialista"});
        const next = specialist({provider: nextProvider, sessionService: specialistStorage.service});
        agent.configure({candidateIdentifiers: [target.identifier, next.identifier]});
        const original = input({
            message: "Mensaje original con imagen",
            userImages: [{url: "data:image/png;base64,aW1hZ2U=", detail: "high"}],
            userContent: [{type: "text", text: "Contexto adicional"}],
            inputFiles: [{filename: "image.png", mimetype: "image/png", size: 3, url: "/files/image.png"}],
        });
        const first = await agent.sendMessage(original);
        const record = [...storage.records.values()][0];
        expect(record).toMatchObject({
            ownerAgentIdentifier: agent.identifier, conversationType: "router", lastResolvedAgentIdentifier: target.identifier,
            messageCount: 2, tokens: 12, inputTokens: 8, outputTokens: 4,
        });
        expect(record.messages![0]).toMatchObject({
            content: original.message, correlationId: first.correlationId, resolvedAgentIdentifier: target.identifier,
            inputFiles: original.inputFiles, userContent: [
                {type: "text", text: original.message}, {type: "text", text: "Contexto adicional"},
                {type: "image", imageUrl: original.userImages![0].url, detail: "high"},
            ],
        });
        const before = structuredClone(record);
        agent.clearSessions();
        target.clearSessions();
        next.clearSessions();
        expect(agent.getSession(input({sessionId: first.sessionId}))).toBeNull();
        const restored = await agent.startSession(input({sessionId: first.sessionId}));
        expect(restored).toMatchObject({
            id: first.sessionId, ownerAgentIdentifier: agent.identifier, conversationType: "router",
            lastResolvedAgentIdentifier: target.identifier, messages: before.messages,
        });
        expect(storage.records.get(record._id)).toEqual(before);
        routing.prompt.mockResolvedValueOnce(classified(decision(next.identifier)));
        const result = await agent.sendMessage(input({sessionId: first.sessionId, message: "Cambiá de tema"}));
        expect(result.resolvedAgentIdentifier).toBe(next.identifier);
        expect(JSON.parse(routing.prompt.mock.calls[1][0].userInput!).lastSpecialist).toBe(target.identifier);
        expect(nextProvider.prompt.mock.calls[0][0].history).toEqual([
            {role: "user", content: before.messages![0].userContent}, {role: "assistant", content: "Respuesta final"},
        ]);
        expect(storage.records.get(record._id)).toMatchObject({
            ownerAgentIdentifier: agent.identifier, conversationType: "router", lastResolvedAgentIdentifier: next.identifier,
            messageCount: 4, tokens: 24, inputTokens: 16, outputTokens: 8,
        });
        expect(storage.service.create).toHaveBeenCalledTimes(1);
        expect(storage.service.updatePartial).toHaveBeenCalledTimes(2);
        expect(storage.service.findBy).toHaveBeenCalledWith("sessionId", first.sessionId, 2);
        for (const method of Object.values(specialistStorage.service)) expect(method).not.toHaveBeenCalled();
    });

    test("a removed/unauthorized last specialist is not offered as a continuity hint", async () => {
        const {agent, target, routing, execution} = fixture();
        const first = await agent.sendMessage(input());
        target.configure({routing: {...target.routing, enabled: false}});
        const next = specialist();
        agent.configure({candidateIdentifiers: [target.identifier, next.identifier]});
        routing.prompt.mockResolvedValueOnce(classified({action: "clarify", agentIdentifier: null, message: "¿Qué necesitás ahora?", requiresMultipleSpecialists: false}));
        await agent.sendMessage(input({sessionId: first.sessionId, message: "Seguimos"}));
        expect(JSON.parse(routing.prompt.mock.calls[1][0].userInput!).lastSpecialist).toBeNull();
        expect(execution.prompt).toHaveBeenCalledTimes(1);
        expect(agent.getSession(input({sessionId: first.sessionId}))!.lastResolvedAgentIdentifier).toBe(target.identifier);
    });
});

describe("DraxAgentRouter failures, audio and concurrent send facade", () => {
    test("classification failure returns a safe 502 turn.error without retries, fallback or tools", async () => {
        const fallback = provider();
        const {agent, routing, execution} = fixture({provider: fallback});
        routing.prompt.mockRejectedValueOnce(new Error("PRIVATE_PROVIDER_FAILURE"));
        const result = await agent.sendMessage(input());
        expect(result.error).toMatchObject({code: "ROUTING_PROVIDER_FAILED", stage: "routing", statusCode: 502});
        expect(result).toMatchObject({tokens: 0, inputTokens: 0, outputTokens: 0});
        expect(JSON.stringify(result)).not.toContain("PRIVATE_PROVIDER_FAILURE");
        expect(routing.prompt).toHaveBeenCalledTimes(1);
        expect(fallback.prompt).not.toHaveBeenCalled();
        expect(execution.prompt).not.toHaveBeenCalled();
        expect(agent.getSession(input({sessionId: result.sessionId}))!.messages).toHaveLength(2);
    });

    test("a tool write followed by specialist failure returns indeterminacy, never retries or delegates elsewhere", async () => {
        const write = vi.fn(async () => ({id: "written"}));
        const {agent, target, routing, execution} = fixture({}, {tools: [{name: "write", description: "Write", execute: write}]});
        const fallback = provider();
        const alternate = specialist({provider: fallback});
        agent.configure({candidateIdentifiers: [target.identifier, alternate.identifier]});
        execution.prompt.mockImplementationOnce(async request => {
            await request.tools![0].execute({title: "Only once"});
            throw new Error("PRIVATE_TIMEOUT_AFTER_WRITE");
        });
        const result = await agent.sendMessage(input());
        expect(result.error).toMatchObject({code: "SPECIALIST_EXECUTION_FAILED", stage: "execution", statusCode: 502, operationMayHaveCompleted: true});
        expect(result.resolvedAgentIdentifier).toBe(target.identifier);
        expect(result.message).toMatch(/podría haberse completado/);
        expect(JSON.stringify(result)).not.toContain("PRIVATE_TIMEOUT_AFTER_WRITE");
        expect(write).toHaveBeenCalledExactlyOnceWith({title: "Only once"});
        expect(execution.prompt).toHaveBeenCalledTimes(1);
        expect(routing.prompt).toHaveBeenCalledTimes(1);
        expect(fallback.prompt).not.toHaveBeenCalled();
        expect(result.tokens).toBe(5);
        expect(agent.getSession(input({sessionId: result.sessionId}))!.messages.map(message => message.role)).toEqual(["user", "assistant"]);
    });

    test("post-execution persistence failure rejects as indeterminate and blocks replay across cleared caches", async () => {
        const storage = persistence();
        const write = vi.fn(async () => ({id: "written"}));
        const {agent, target, routing, execution} = fixture({sessionService: storage.service}, {tools: [{name: "write", description: "Write", execute: write}]});
        execution.prompt.mockImplementation(async request => {
            await request.tools![0].execute({});
            return structuredClone(specialistResponse);
        });
        const session = await agent.startSession(input());
        storage.service.updatePartial.mockRejectedValueOnce(new Error("PRIVATE_PERSISTENCE_FAILURE"));
        await expect(agent.sendMessage(input({sessionId: session.id}))).rejects.toMatchObject({
            code: "SESSION_PERSISTENCE_INDETERMINATE", stage: "persistence", statusCode: 500, operationMayHaveCompleted: true,
        });
        agent.clearSessions();
        target.clearSessions();
        await expect(agent.sendMessage(input({sessionId: session.id}))).rejects.toMatchObject({code: "SESSION_PERSISTENCE_INDETERMINATE"});
        expect(write).toHaveBeenCalledTimes(1);
        expect(routing.prompt).toHaveBeenCalledTimes(1);
        expect(execution.prompt).toHaveBeenCalledTimes(1);
        expect([...storage.records.values()][0].messages).toEqual([]);
    });

    test("clarification audio uses the mocked PromptAudioService.build and the same correlation", async () => {
        const {agent, routing, execution} = fixture();
        routing.prompt.mockResolvedValueOnce(classified({action: "clarify", agentIdentifier: null, message: "¿Qué tarea?", requiresMultipleSpecialists: false}));
        boundaries.audio.mockResolvedValueOnce(structuredClone(audio));
        const result = await agent.executeTurn(input({correlationId: "audio-correlation", audioResponse: {provider: "mock", voiceId: "voice"}}), context());
        expect(result).toMatchObject({message: "¿Qué tarea?", audio, correlationId: "audio-correlation"});
        expect(result.error).toBeUndefined();
        expect(boundaries.audio).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
            systemPrompt: "", audioResponse: {provider: "mock", voiceId: "voice"},
            operationTitle: "drax-agent-router:audio-correlation:audio", operationGroup: "drax-agent-router", user: "user", tenant: "tenant",
        }), "¿Qué tarea?");
        expect(routing.prompt.mock.calls[0][0].audioResponse).toBe(false);
        expect(execution.prompt).not.toHaveBeenCalled();
    });

    test("audio failure keeps clarification text and reports 502, preserving any earlier routing error", async () => {
        const {agent, routing, execution} = fixture();
        routing.prompt.mockResolvedValueOnce(classified({action: "clarify", agentIdentifier: null, message: "¿Qué tarea?", requiresMultipleSpecialists: false}));
        boundaries.audio.mockRejectedValue(new Error("PRIVATE_AUDIO_FAILURE"));
        const clarification = await agent.executeTurn(input({audioResponse: true}), context());
        expect(clarification.message).toBe("¿Qué tarea?");
        expect(clarification.error).toMatchObject({code: "ROUTER_AUDIO_FAILED", stage: "audio", statusCode: 502});
        agent.configure({candidateIdentifiers: []});
        const unavailable = await agent.executeTurn(input({audioResponse: true}), context());
        expect(unavailable.error).toMatchObject({code: "ROUTER_NO_CANDIDATES", statusCode: 503, audioFailed: true});
        expect(JSON.stringify([clarification, unavailable])).not.toContain("PRIVATE_AUDIO_FAILURE");
        expect(execution.prompt).not.toHaveBeenCalled();
    });

    test("send total time includes canonical session persistence without adding token usage twice", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01"));
        const storage = persistence();
        const create = storage.service.create.getMockImplementation()!;
        const update = storage.service.updatePartial.getMockImplementation()!;
        storage.service.create.mockImplementation(async data => {
            vi.advanceTimersByTime(5);
            return create(data);
        });
        storage.service.updatePartial.mockImplementation(async (id, data) => {
            vi.advanceTimersByTime(7);
            return update(id, data);
        });
        const {agent, target, routing, execution} = fixture({sessionService: storage.service});
        routing.prompt.mockImplementationOnce(async () => {
            vi.advanceTimersByTime(11);
            return classified(decision(target.identifier));
        });
        execution.prompt.mockImplementationOnce(async () => {
            vi.advanceTimersByTime(17);
            return structuredClone(specialistResponse);
        });
        const result = await agent.sendMessage(input());
        expect(result).toMatchObject({
            time: 40, tokens: 12, inputTokens: 8, outputTokens: 4,
            metrics: {routingTime: 11, executionTime: 17, totalTime: 40},
        });
        expect([...storage.records.values()][0].tokens).toBe(12);
    });

    test("a TTS failure preserves a completed specialist turn, usage and navigation without replay", async () => {
        const storage = persistence();
        const write = vi.fn(async () => ({id: "written-once"}));
        const {agent, target, routing, execution} = fixture({sessionService: storage.service}, {tools: [{
            name: "task_create", description: "Write", execute: write,
            navigation: {entityName: "task", method: "create"},
        }]});
        execution.prompt.mockImplementationOnce(async request => {
            expect(request.audioResponse).toBe(false);
            await request.tools![0].execute({title: "Only once"});
            return structuredClone(specialistResponse);
        });
        boundaries.audio.mockRejectedValueOnce(new Error("PRIVATE_TTS_FAILURE"));
        const result = await agent.sendMessage(input({audioResponse: true}));
        expect(result).toMatchObject({
            message: "Respuesta final", output: "Respuesta final", resolvedAgentIdentifier: target.identifier,
            navigationPath: "/crud/task?mode=edit&id=written-once", tokens: 12, inputTokens: 8, outputTokens: 4,
            error: {code: "ROUTER_AUDIO_FAILED", stage: "audio", operationMayHaveCompleted: false, audioFailed: true},
        });
        expect(result.metrics).toMatchObject({routingTokens: 5, executionTokens: 7});
        expect(result.metrics!.audioTime).toBeGreaterThanOrEqual(0);
        expect(boundaries.audio).toHaveBeenCalledExactlyOnceWith(expect.anything(), "Respuesta final");
        expect(write).toHaveBeenCalledTimes(1);
        expect(execution.prompt).toHaveBeenCalledTimes(1);
        expect(routing.prompt).toHaveBeenCalledTimes(1);
        const record = [...storage.records.values()][0];
        expect(record.tokens).toBe(12);
        expect(record.messages!.map(message => message.content)).toEqual([input().message, "Respuesta final"]);
        expect(JSON.stringify(result)).not.toContain("PRIVATE_TTS_FAILURE");
    });

    test.each(["routing", "execution"] as const)("send facade holds a global session lock during %s and releases it afterward", async phase => {
        const {agent, target, routing, execution} = fixture();
        const entered = deferred<void>();
        const release = deferred<void>();
        const blockedProvider = phase === "routing" ? routing : execution;
        blockedProvider.prompt.mockImplementationOnce(async () => {
            entered.resolve();
            await release.promise;
            return phase === "routing" ? classified(decision(target.identifier)) : structuredClone(specialistResponse);
        });
        const session = await agent.startSession(input());
        const twin = new DraxAgentRouter(agent.identifier).configure({
            sessionService: false, candidateIdentifiers: [target.identifier], routingProvider: routing,
        });
        const pending = agent.sendMessage(input({sessionId: session.id}));
        try {
            await entered.promise;
            await expect(agent.sendMessage(input({sessionId: session.id}))).rejects.toMatchObject({code: "SESSION_BUSY", statusCode: 409});
            await expect(twin.sendMessage(input({sessionId: session.id}))).rejects.toMatchObject({code: "SESSION_BUSY", statusCode: 409});
            await expect(twin.startSession(input({sessionId: session.id}))).rejects.toMatchObject({code: "SESSION_BUSY", statusCode: 409});
            expect(routing.prompt).toHaveBeenCalledTimes(1);
            expect(execution.prompt).toHaveBeenCalledTimes(phase === "routing" ? 0 : 1);
        } finally {
            release.resolve();
            await pending;
        }
        await expect(agent.sendMessage(input({sessionId: session.id, message: "Siguiente"}))).resolves.toMatchObject({message: "Respuesta final"});
        expect(routing.prompt).toHaveBeenCalledTimes(2);
        expect(execution.prompt).toHaveBeenCalledTimes(2);
        expect(agent.getSession(input({sessionId: session.id}))!.messages).toHaveLength(4);
    });

    test("a controlled specialist denial preserves access semantics rather than suggesting a completed write", async () => {
        const {agent, target, execution} = fixture();
        const execute = vi.spyOn(target, "executeTurn").mockRejectedValueOnce(new DraxAgentError({
            code: "AGENT_ACCESS_DENIED", stage: "access", statusCode: 403, message: "Denied",
        }));
        const result = await agent.sendMessage(input());
        expect(result.error).toMatchObject({code: "ROUTING_TARGET_DENIED", statusCode: 403, operationMayHaveCompleted: false});
        expect(result.resolvedAgentIdentifier).toBeUndefined();
        expect(execute).toHaveBeenCalledTimes(1);
        expect(execution.prompt).not.toHaveBeenCalled();
    });
});
