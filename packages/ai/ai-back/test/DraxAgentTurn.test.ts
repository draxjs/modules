import {randomUUID} from "node:crypto";
import {describe, expect, test, vi} from "vitest";
import {DraxAgent} from "../src/agents/DraxAgent.js";
import {DraxAgentError} from "../src/agents/DraxAgentError.js";
import type {IPromptParams, IPromptResponse} from "../src/interfaces/IAIProvider.js";
import type {
    DraxAgentAccessConfig,
    DraxAgentAccessContext,
    DraxAgentConfig,
    DraxAgentMessageInput,
    DraxAgentPromptContext,
    DraxAgentTurnOutput,
} from "../src/interfaces/IDraxAgent.js";

// These tests must never initialize a database or a real provider.
vi.mock("../src/factory/services/AgentSessionServiceFactory.js", () => ({
    default: {get instance() { throw new Error("Unexpected persistence factory access"); }},
}));
vi.mock("../src/factory/ai/AiProviderFactory.js", () => ({
    default: {instance: () => { throw new Error("Unexpected provider factory access"); }},
}));

const response: IPromptResponse = {output: "final", tokens: 7, inputTokens: 5, outputTokens: 2, time: 12};
const turn: DraxAgentTurnOutput = {...response, message: "final"};
const accessContext: DraxAgentAccessContext = {
    userId: "user", tenantId: "tenant", permissions: ["read"], authenticated: true,
};

function provider() {
    return {prompt: vi.fn<(input: IPromptParams) => Promise<IPromptResponse>>().mockResolvedValue(structuredClone(response))};
}

function agent(config: DraxAgentConfig = {}, identifier: string = randomUUID()) {
    return new DraxAgent(identifier).configure({provider: provider(), sessionService: false, ...config});
}

function context(): DraxAgentPromptContext {
    return {
        session: {
            id: randomUUID(), userId: "user", tenantId: "tenant",
            messages: [{role: "user", content: [{type: "text", text: "history"}]}],
            createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-02"),
        },
    };
}

function freeze<T>(value: T): T {
    if (value && typeof value === "object") {
        Object.values(value).forEach(freeze);
        Object.freeze(value);
    }
    return value;
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(done => { resolve = done; });
    return {promise, resolve};
}

function persistence(seed: any[] = []) {
    const records = new Map<string, any>(seed.map(record => [record._id, structuredClone(record)]));
    const service = {
        create: vi.fn(async (data: any) => {
            const record = {_id: randomUUID(), ...structuredClone(data)};
            records.set(record._id, record);
            return structuredClone(record);
        }),
        findBy: vi.fn(async (_field: string, id: string, limit: number) =>
            structuredClone([...records.values()].filter(record => record.sessionId === id).slice(0, limit))),
        findById: vi.fn(async (id: string) => structuredClone(records.get(id) ?? null)),
        updatePartial: vi.fn(async (id: string, data: any) => {
            const record = {...records.get(id), ...structuredClone(data)};
            records.set(id, record);
            return structuredClone(record);
        }),
    };
    return {records, service: service as typeof service & NonNullable<Exclude<DraxAgentConfig["sessionService"], false>>};
}

function stored(overrides: any = {}) {
    return {
        _id: randomUUID(), sessionId: randomUUID(), user: null, tenant: null,
        messages: [], tokens: 0, inputTokens: 0, outputTokens: 0, ...overrides,
    };
}

class Router extends DraxAgent {
    override get type(): "router" { return "router"; }
}

describe("DraxAgent process-local session reservations", () => {
    test("excludes core and other CRUD reservations without claiming the session or queuing", async () => {
        const {service} = persistence();
        const mock = provider();
        const first = agent({sessionService: service, provider: mock});
        const second = agent({sessionService: service, provider: mock});
        const sessionId = randomUUID();
        const entered = deferred<void>();
        const release = deferred<void>();
        const value = {reserved: true};
        const competing = vi.fn();
        const running = DraxAgent.withSessionReservation(sessionId, async () => {
            entered.resolve();
            await release.promise;
            return value;
        });
        await entered.promise;
        try {
            expect(DraxAgent.isSessionProtected(sessionId)).toBe(false);
            first.clearSessions();
            await expect(DraxAgent.withSessionReservation(sessionId, competing)).rejects.toMatchObject({code: "SESSION_BUSY", statusCode: 409});
            await expect(first.startSession({sessionId})).rejects.toMatchObject({code: "SESSION_BUSY", sessionId: undefined});
            await expect(second.sendMessage({sessionId, message: "blocked"})).rejects.toMatchObject({
                code: "SESSION_BUSY", statusCode: 409, correlationId: expect.any(String), sessionId: undefined,
            });
            expect(competing).not.toHaveBeenCalled();
            expect(service.findBy).not.toHaveBeenCalled();
            expect(service.create).not.toHaveBeenCalled();
            expect(mock.prompt).not.toHaveBeenCalled();
            await expect(DraxAgent.withSessionReservation(randomUUID(), () => "independent")).resolves.toBe("independent");
        } finally {
            release.resolve();
            await running;
        }
        expect(await running).toBe(value);
        await expect(first.startSession({sessionId})).resolves.toMatchObject({id: sessionId});
    });

    test.each(["sync", "async"])("releases a reservation after a %s action failure", async kind => {
        const sessionId = randomUUID();
        const failure = new Error("mutation failed");
        await expect(DraxAgent.withSessionReservation(sessionId, () => {
            if (kind === "sync") { throw failure; }
            return Promise.reject(failure);
        })).rejects.toBe(failure);
        await expect(DraxAgent.withSessionReservation(sessionId, () => "released")).resolves.toBe("released");
        await expect(agent().startSession({sessionId})).resolves.toMatchObject({id: sessionId});
    });

    test("core resolution excludes CRUD before ownership has been claimed and releases after lookup failure", async () => {
        const {service} = persistence();
        const entered = deferred<void>();
        const release = deferred<void>();
        service.findBy.mockImplementationOnce(async () => {
            entered.resolve();
            await release.promise;
            throw new Error("lookup failed");
        });
        const sessionId = randomUUID();
        const first = agent({sessionService: service});
        const running = first.startSession({sessionId}).catch(error => error);
        await entered.promise;
        const competing = vi.fn();
        try {
            await expect(DraxAgent.withSessionReservation(sessionId, competing)).rejects.toMatchObject({code: "SESSION_BUSY", statusCode: 409});
            expect(competing).not.toHaveBeenCalled();
            first.clearSessions();
            await expect(DraxAgent.withSessionReservation(sessionId, competing)).rejects.toMatchObject({code: "SESSION_BUSY"});
        } finally {
            release.resolve();
            await running;
        }
        expect(await running).toMatchObject({code: "SESSION_RESOLUTION_FAILED"});
        await expect(DraxAgent.withSessionReservation(sessionId, () => "released")).resolves.toBe("released");
    });
});

describe("DraxAgent turn contracts", () => {
    test("exposes specialist kind and detached routing metadata", () => {
        const specialist = agent({routing: {eligible: true, enabled: true, capabilities: "tasks", examples: ["find"], recommended: true}});
        expect(specialist.type).toBe("specialist");
        expect(new Router().type).toBe("router");
        const routing = specialist.routing!;
        routing.examples!.push("mutated");
        routing.enabled = false;
        expect(specialist.routing).toEqual({eligible: true, enabled: true, capabilities: "tasks", examples: ["find"], recommended: true});
        expect(agent().routing).toBeUndefined();
    });

    test("executes without resolving, caching, creating or updating sessions", async () => {
        const {service} = persistence();
        const specialist = agent({sessionService: service});
        const ctx = context();
        const before = structuredClone(ctx);
        const result = await specialist.executeTurn({message: "hello", correlationId: "internal"}, ctx);
        expect(result).toMatchObject({...turn, correlationId: "internal", navigationPath: null});
        expect(result).not.toHaveProperty("agentIdentifier");
        expect(result).not.toHaveProperty("sessionId");
        expect(ctx).toEqual(before);
        expect(specialist.getSession({sessionId: ctx.session.id})).toBeNull();
        for (const method of [service.findBy, service.findById, service.create, service.updatePartial]) {
            expect(method).not.toHaveBeenCalled();
        }
        // A direct turn must not claim the supplied session id either.
        await expect(new Router("other").configure({sessionService: false}).startSession({sessionId: ctx.session.id})).resolves.toBeDefined();
    });

    test("deeply isolates input/session and every callback/provider boundary, preserving functions", async () => {
        const input = freeze<DraxAgentMessageInput>({
            message: "hello", userId: "user", tenantId: "tenant", accessContext: structuredClone(accessContext),
            userImages: [{url: "image"}], userContent: [{type: "text", text: "content"}],
            inputFiles: [{filename: "file"}], memory: [{key: "k", value: "memory"}], knowledgeBase: ["knowledge"],
            audioResponse: {voiceSettings: {stability: 0.4}},
        });
        const ctx = freeze({...context(), input});
        const beforeInput = structuredClone(input);
        const beforeContext = structuredClone(ctx);
        const execute = vi.fn(async () => ({id: "record"}));
        const tool = {name: "lookup", description: "lookup", parameters: {nested: {value: "original"}},
            navigation: {entityName: "task", method: "findById"}, execute};
        const mutate = (copy: DraxAgentPromptContext) => {
            copy.session.messages.length = 0;
            copy.session.updatedAt.setFullYear(1900);
            copy.input!.message = "changed";
            copy.input!.memory![0].value = "changed";
            copy.input!.accessContext!.userId = "changed";
        };
        const mock = provider();
        mock.prompt.mockImplementation(async params => {
            expect(params.userInput).toBe("hello");
            expect(params.memory![0].value).toBe("memory");
            expect(params.history).toHaveLength(1);
            expect(params.systemPrompt).toContain("userId: user");
            params.userImages![0].url = "changed";
            (params.userContent![0] as {text: string}).text = "changed";
            params.inputFiles![0].filename = "changed";
            params.memory![0].value = "changed";
            params.knowledgeBase![0] = "changed";
            (params.audioResponse as any).voiceSettings.stability = 1;
            (params.history![0].content[0] as any).text = "changed";
            (params.tools![0].parameters as any).nested.value = "changed";
            await params.tools![0].execute({id: "record"});
            return structuredClone(response);
        });
        const specialist = agent({
            provider: mock,
            access: {authorize: trusted => { trusted.userId = "changed"; return true; }},
            toolBuilders: copy => { mutate(copy); return [{getTools: () => [tool], getSystemPromptSection: () => "builder"}]; },
            tools: copy => { expect(copy.input!.message).toBe("hello"); mutate(copy); return []; },
            systemPrompt: copy => { expect(copy.session.messages).toHaveLength(1); mutate(copy); return "prompt"; },
        });
        const result = await specialist.executeTurn(input, ctx);
        expect(result.navigationPath).toBe("/crud/task?mode=view&id=record");
        expect(execute).toHaveBeenCalledOnce();
        expect(tool.parameters.nested.value).toBe("original");
        expect(input).toEqual(beforeInput);
        expect(ctx).toEqual(beforeContext);
    });

    test("uses a configured specialist model by default and preserves explicit model override", async () => {
        const mock = provider();
        const specialist = agent({provider: mock, model: "specialist-model"});
        await specialist.executeTurn({message: "one"}, context());
        await specialist.executeTurn({message: "two", model: "explicit"}, context());
        expect(mock.prompt.mock.calls.map(([request]) => request.model)).toEqual(["specialist-model", "explicit"]);
    });

    test("keeps normalization, limits, operation options and audio in the standalone turn", async () => {
        const mock = provider();
        const audio = {audio: "YQ==", contentType: "audio/mpeg", encoding: "base64" as const,
            meta: {provider: "tts", model: "voice", voiceId: "id", size: 1, time: 3}};
        mock.prompt.mockResolvedValue({...response, output: {value: "original"}, audio});
        const specialist = agent({provider: mock, historyLimit: 1, toolMaxIterations: 4,
            operationTitle: "title", operationGroup: "group",
            normalizeOutput: output => { output.value = "normalized"; return output.value; }});
        const ctx = context();
        ctx.session.messages.push({role: "assistant", content: "last"});
        const result = await specialist.executeTurn({message: "hello", audioResponse: true}, ctx);
        expect(mock.prompt.mock.calls[0][0]).toMatchObject({history: [{role: "assistant", content: "last"}],
            toolMaxIterations: 4, operationTitle: "title", operationGroup: "group", audioResponse: true});
        expect(result).toMatchObject({message: "normalized", output: {value: "original"}, audio});
    });

    test.each<[string, DraxAgentAccessConfig]>([
        ["user", {requireUser: true}], ["tenant", {requireTenant: true}],
        ["permission", {permissions: ["read"]}], ["callback", {authorize: () => true}],
    ])("fails closed for %s restrictions without a trusted context on all entry points", async (_name, access) => {
        const mock = provider();
        const {service} = persistence();
        const specialist = agent({provider: mock, sessionService: service, access});
        expect(await specialist.canAccess()).toBe(false);
        await expect(specialist.assertAgentAccess()).rejects.toMatchObject({code: "AGENT_ACCESS_DENIED", statusCode: 403});
        await expect(specialist.executeTurn({message: "hello", userId: "user", tenantId: "tenant"}, context())).rejects.toBeInstanceOf(DraxAgentError);
        await expect(specialist.startSession({userId: "user", tenantId: "tenant"})).rejects.toBeInstanceOf(DraxAgentError);
        await expect(specialist.sendMessage({message: "hello", userId: "user", tenantId: "tenant"})).rejects.toMatchObject({stage: "access", correlationId: expect.any(String)});
        expect(mock.prompt).not.toHaveBeenCalled();
        expect(service.create).not.toHaveBeenCalled();
        expect(service.findBy).not.toHaveBeenCalled();
    });

    test.each([false, true])("denies disabled agents at every backend entry point (access configured: %s)", async configuredAccess => {
        const mock = provider();
        const {service} = persistence();
        const authorize = vi.fn(async () => true);
        const tools = vi.fn(() => []);
        const specialist = agent({provider: mock, sessionService: service, routing: {enabled: false}, tools,
            ...(configuredAccess ? {access: {authorize}} : {})});
        expect(await specialist.canAccess()).toBe(false);
        expect(await specialist.canAccess(accessContext)).toBe(false);
        await expect(specialist.assertAgentAccess(accessContext)).rejects.toMatchObject({code: "AGENT_ACCESS_DENIED"});
        await expect(specialist.startSession({accessContext})).rejects.toMatchObject({statusCode: 403, stage: "access"});
        await expect(specialist.executeTurn({message: "hello", accessContext}, context())).rejects.toMatchObject({code: "AGENT_ACCESS_DENIED"});
        await expect(specialist.sendMessage({message: "hello", accessContext})).rejects.toMatchObject({code: "AGENT_ACCESS_DENIED", correlationId: expect.any(String)});
        expect(authorize).not.toHaveBeenCalled();
        expect(tools).not.toHaveBeenCalled();
        expect(mock.prompt).not.toHaveBeenCalled();
        expect(service.findBy).not.toHaveBeenCalled();
        expect(service.create).not.toHaveBeenCalled();
        specialist.configure({routing: {enabled: true}});
        await expect(specialist.executeTurn({message: "enabled", accessContext}, context())).resolves.toMatchObject({message: "final"});
    });

    test("checks all permissions, explicit unauthenticated state and authorize failures without leaking errors", async () => {
        expect(await agent().canAccess()).toBe(true);
        expect(await agent({access: {permissions: [], requireUser: false}}).canAccess()).toBe(true);
        const specialist = agent({access: {requireUser: true, requireTenant: true, permissions: ["read"], authorize: async () => true}});
        expect(await specialist.canAccess(accessContext)).toBe(true);
        expect(await specialist.canAccess({...accessContext, authenticated: undefined})).toBe(true);
        expect(await specialist.canAccess({...accessContext, permissions: []})).toBe(false);
        expect(await specialist.canAccess({...accessContext, authenticated: false})).toBe(false);
        expect(await specialist.canAccess({...accessContext, userId: null})).toBe(false);
        expect(await specialist.canAccess({...accessContext, tenantId: null})).toBe(false);
        specialist.configure({access: {authorize: () => { throw new Error("secret"); }}});
        expect(await specialist.canAccess(accessContext)).toBe(false);
        specialist.configure({access: {authorize: async () => false}});
        await expect(specialist.assertAgentAccess(accessContext)).rejects.toMatchObject({message: "Access to this agent is denied."});
    });

    test("accepts trusted backend access context on start, send and direct turns", async () => {
        const mock = provider();
        const specialist = agent({provider: mock, access: {requireUser: true, requireTenant: true, permissions: ["read"]}});
        const session = await specialist.startSession({userId: "user", tenantId: "tenant", accessContext});
        const input = {sessionId: session.id, userId: "user", tenantId: "tenant", accessContext, message: "hello"};
        await expect(specialist.sendMessage(input)).resolves.toMatchObject({message: "final"});
        await expect(specialist.executeTurn(input, {session})).resolves.toMatchObject({message: "final"});
        expect(mock.prompt).toHaveBeenCalledTimes(2);
        expect(accessContext.userId).toBe("user");
    });

    test.each([true, false])("preserves operationMayHaveCompleted=%s through controlled error wrappers", async operationMayHaveCompleted => {
        const mock = provider();
        const error = new DraxAgentError({code: "SAFE_FAILURE", message: "Safe operation failure.",
            statusCode: 502, stage: "execution", operationMayHaveCompleted});
        expect(error.operationMayHaveCompleted).toBe(operationMayHaveCompleted);
        mock.prompt.mockRejectedValue(error);
        const specialist = agent({provider: mock});
        await expect(specialist.executeTurn({message: "hello", correlationId: "direct"}, context())).rejects.toMatchObject({
            code: "SAFE_FAILURE", statusCode: 502, message: "Safe operation failure.",
            correlationId: "direct", stage: "execution", operationMayHaveCompleted,
        });
        await expect(specialist.sendMessage({message: "hello"})).rejects.toMatchObject({
            code: "SAFE_FAILURE", correlationId: expect.any(String), operationMayHaveCompleted,
        });
    });

    test("wraps provider/prompt failures safely and does not append partial history", async () => {
        const mock = provider();
        mock.prompt.mockRejectedValueOnce(new Error("secret provider token"));
        const specialist = agent({provider: mock});
        const session = await specialist.startSession();
        await expect(specialist.sendMessage({sessionId: session.id, message: "hello"})).rejects.toMatchObject({
            code: "AGENT_TURN_FAILED", stage: "provider", statusCode: 500,
            message: "Unable to execute the agent turn.", correlationId: expect.any(String),
        });
        expect(session.messages).toEqual([]);
        // Failure releases the lock; no queued/replayed invocation occurred.
        await specialist.sendMessage({sessionId: session.id, message: "again"});
        expect(mock.prompt).toHaveBeenCalledTimes(2);
        specialist.setSystemPrompt(() => { throw new Error("secret prompt"); });
        await expect(specialist.executeTurn({message: "hello"}, context())).rejects.toMatchObject({stage: "prompt"});
        expect(mock.prompt).toHaveBeenCalledTimes(2);
    });
});

describe("DraxAgent send wrapper and session safety", () => {
    test("persists only user/final assistant, with server UUID, resolution, attachments and router ownership", async () => {
        const {service, records} = persistence();
        class DelegatingRouter extends Router {
            seen?: DraxAgentMessageInput;
            override async executeTurn(input: DraxAgentMessageInput, ctx: DraxAgentPromptContext): Promise<DraxAgentTurnOutput> {
                this.seen = structuredClone(input);
                ctx.session.messages.push({role: "assistant", content: "private selection"});
                input.message = "private modified input";
                return {...turn, resolvedAgentIdentifier: "specialist", correlationId: "overridden",
                    metrics: {delegations: 1}, error: {code: "CONTROLLED", message: "safe", stage: "routing", operationMayHaveCompleted: true}};
            }
        }
        const router = new DelegatingRouter(randomUUID()).configure({sessionService: service});
        const input = freeze<DraxAgentMessageInput>({message: "question", correlationId: "client",
            userContent: [{type: "text", text: "question"}], inputFiles: [{filename: "document"}]});
        const result = await router.sendMessage(input);
        expect(router.seen!.correlationId).toMatch(/^[0-9a-f-]{36}$/);
        expect(result.correlationId).toBe(router.seen!.correlationId);
        expect(result.correlationId).not.toBe("client");
        expect(result).toMatchObject({agentIdentifier: router.identifier, resolvedAgentIdentifier: "specialist",
            metrics: {delegations: 1}, error: {code: "CONTROLLED", operationMayHaveCompleted: true}});
        const record = [...records.values()][0];
        expect(record).toMatchObject({ownerAgentIdentifier: router.identifier, conversationType: "router",
            lastResolvedAgentIdentifier: "specialist", messageCount: 2, tokens: 7});
        expect(record.messages).toEqual([
            expect.objectContaining({role: "user", content: "question", correlationId: result.correlationId,
                resolvedAgentIdentifier: "specialist", userContent: input.userContent, inputFiles: input.inputFiles}),
            expect.objectContaining({role: "assistant", content: "final", correlationId: result.correlationId, resolvedAgentIdentifier: "specialist"}),
        ]);
        expect(service.create).toHaveBeenCalledOnce();
        expect(service.updatePartial).toHaveBeenCalledOnce();
        expect(input.message).toBe("question");
    });

    test("restores ownership, resolved agent and per-message metadata on a cold instance", async () => {
        const {service, records} = persistence();
        const identifier = randomUUID();
        const mock = provider();
        const first = agent({sessionService: service, provider: mock}, identifier);
        const output = await first.sendMessage({message: "hello", userId: "user", tenantId: "tenant",
            userContent: [{type: "text", text: "hello"}], inputFiles: [{filename: "file"}]});
        const record = [...records.values()][0];
        record.lastResolvedAgentIdentifier = "specialist";
        record.messages.forEach((message: any) => { message.resolvedAgentIdentifier = "specialist"; });
        first.clearSessions();
        const second = agent({sessionService: service, provider: mock}, identifier);
        const session = await second.startSession({sessionId: output.sessionId, userId: "user", tenantId: "tenant"});
        expect(session).toMatchObject({ownerAgentIdentifier: identifier, conversationType: "specialist", lastResolvedAgentIdentifier: "specialist"});
        expect(session.messages).toEqual(record.messages);
        expect(session.messages[0].createdAt).toBeInstanceOf(Date);
        await second.sendMessage({sessionId: session.id, userId: "user", tenantId: "tenant", message: "next"});
        const updated = records.get(record._id);
        expect(updated.messages.slice(0, 2)).toEqual(record.messages);
        expect(updated.tokens).toBe(14);
        expect(service.create).toHaveBeenCalledOnce();
        expect(mock.prompt.mock.calls[1][0].history).toEqual([{role: "user", content: [{type: "text", text: "hello"}]}, {role: "assistant", content: "final"}]);
        expect(service.findBy).toHaveBeenCalledWith("sessionId", output.sessionId, 2);
    });

    test.each<{
        name: string;
        userContent?: DraxAgentMessageInput["userContent"];
        expected: DraxAgentMessageInput["userContent"];
    }>([
        {name: "userImages only", expected: [
            {type: "text", text: "original question"}, {type: "image", imageUrl: "data:image/png;base64,aW1hZ2U=", detail: "high"},
        ]},
        {name: "additional content without original text", userContent: [{type: "text", text: "additional context"}], expected: [
            {type: "text", text: "original question"}, {type: "text", text: "additional context"},
            {type: "image", imageUrl: "data:image/png;base64,aW1hZ2U=", detail: "high"},
        ]},
        {name: "original text and image already represented", userContent: [
            {type: "text", text: "original question"}, {type: "image", imageUrl: "data:image/png;base64,aW1hZ2U=", detail: "high"},
        ], expected: [
            {type: "text", text: "original question"}, {type: "image", imageUrl: "data:image/png;base64,aW1hZ2U=", detail: "high"},
        ]},
    ])("replays images through send/hydrate/execute followup: $name", async ({userContent, expected}) => {
        const {service, records} = persistence();
        const mock = provider();
        const identifier = randomUUID();
        const first = agent({provider: mock, sessionService: service}, identifier);
        const input = freeze<DraxAgentMessageInput>({message: "original question", userContent,
            userImages: [{url: "data:image/png;base64,aW1hZ2U=", detail: "high"}],
            inputFiles: [{filename: "notes.pdf", mimetype: "application/pdf", size: 123}]});
        const original = structuredClone(input);
        const output = await first.sendMessage(input);
        expect(mock.prompt.mock.calls[0][0]).toMatchObject({userInput: original.message,
            userImages: original.userImages, inputFiles: original.inputFiles});
        expect(mock.prompt.mock.calls[0][0].userContent).toEqual(original.userContent);
        expect(input).toEqual(original);
        const record = [...records.values()][0];
        expect(record.messages[0]).toMatchObject({content: "original question", userContent: expected, inputFiles: original.inputFiles});
        const storedBefore = structuredClone(record);
        first.clearSessions();
        const cold = agent({provider: mock, sessionService: service}, identifier);
        const session = await cold.startSession({sessionId: output.sessionId});
        expect(session.messages[0].userContent).toEqual(expected);
        const sessionBefore = structuredClone(session);
        mock.prompt.mockImplementationOnce(async params => {
            expect(params.history).toEqual([
                {role: "user", content: expected}, {role: "assistant", content: "final"},
            ]);
            // Neither provider mutation nor direct execution may change restored/persisted history.
            (params.history![0].content as any[])[0].text = "mutated";
            (params.history![0].content as any[]).push({type: "text", text: "mutated"});
            return structuredClone(response);
        });
        await cold.executeTurn({message: "what is in that image?"}, {session});
        expect(session).toEqual(sessionBefore);
        expect(records.get(record._id)).toEqual(storedBefore);
        expect(service.updatePartial).toHaveBeenCalledOnce();
        await cold.sendMessage({sessionId: session.id, message: "continue"});
        expect(records.get(record._id).messages.slice(0, 2)).toEqual(storedBefore.messages);
        expect(mock.prompt.mock.calls[2][0].history![0].content).toEqual(expected);
    });

    test("retains legacy text and metadata parts when historical userContent omits the original text", async () => {
        const historicalParts: DraxAgentMessageInput["userContent"] = [
            {type: "text", text: "legacy additional text"},
            {type: "image", imageUrl: "data:image/png;base64,bGVnYWN5", detail: "low"},
        ];
        const record = stored({messages: [
            {role: "user", content: "legacy original", userContent: historicalParts,
                inputFiles: [{filename: "legacy.pdf"}], correlationId: "legacy-correlation"},
            {role: "assistant", content: "legacy answer"},
            {role: "user", content: "plain legacy text", userContent: []},
        ]});
        const before = structuredClone(record);
        const {service, records} = persistence([record]);
        const mock = provider();
        const specialist = agent({provider: mock, sessionService: service});
        const session = await specialist.startSession({sessionId: record.sessionId});
        await specialist.sendMessage({sessionId: session.id, message: "followup"});
        expect(mock.prompt.mock.calls[0][0].history).toEqual([
            {role: "user", content: [{type: "text", text: "legacy original"}, ...historicalParts]},
            {role: "assistant", content: "legacy answer"},
            {role: "user", content: "plain legacy text"},
        ]);
        expect(records.get(record._id).messages.slice(0, 3)).toEqual(before.messages.map((message: any) => ({
            ...message, createdAt: expect.any(Date),
        })));
        expect(session.messages.slice(0, 3)).toEqual(before.messages);
    });

    test("preserves legacy array content alongside metadata in detached provider history", async () => {
        const ctx = context();
        ctx.session.messages[0].content = [
            {type: "text", text: "original array"}, {type: "image", imageUrl: "legacy-image"},
        ];
        ctx.session.messages[0].userContent = [{type: "text", text: "additional metadata"}];
        const before = structuredClone(ctx);
        const mock = provider();
        await agent({provider: mock}).executeTurn({message: "followup"}, ctx);
        expect(mock.prompt.mock.calls[0][0].history![0].content).toEqual([
            {type: "text", text: "original array"}, {type: "image", imageUrl: "legacy-image"},
            {type: "text", text: "additional metadata"},
        ]);
        expect(ctx).toEqual(before);
    });

    test("rejects concurrent send/start operations globally across instances and releases the lock", async () => {
        const entered = deferred<void>();
        const release = deferred<IPromptResponse>();
        const mock = provider();
        mock.prompt.mockImplementationOnce(() => { entered.resolve(); return release.promise; });
        const {service} = persistence();
        const identifier = randomUUID();
        const first = agent({sessionService: service, provider: mock}, identifier);
        const second = agent({sessionService: service, provider: mock}, identifier);
        const sessionId = randomUUID();
        const running = first.sendMessage({sessionId, message: "first"});
        await entered.promise;
        await expect(second.sendMessage({sessionId, message: "concurrent"})).rejects.toMatchObject({code: "SESSION_BUSY", statusCode: 409, correlationId: expect.any(String)});
        await expect(second.startSession({sessionId})).rejects.toMatchObject({code: "SESSION_BUSY"});
        await expect(agent().sendMessage({sessionId, message: "different owner"})).rejects.toMatchObject({code: "SESSION_BUSY"});
        expect(mock.prompt).toHaveBeenCalledOnce();
        expect(service.updatePartial).not.toHaveBeenCalled();
        // A different id is not blocked, and rejected operations are never queued.
        await second.sendMessage({sessionId: randomUUID(), message: "independent"});
        release.resolve(structuredClone(response));
        await running;
        expect(mock.prompt).toHaveBeenCalledTimes(2);
        await second.sendMessage({sessionId, message: "after"});
        expect(mock.prompt).toHaveBeenCalledTimes(3);
        expect(service.updatePartial.mock.calls[2][1].messages).toHaveLength(4);
    });

    test("locks startSession during creation without deadlocking send on a new session", async () => {
        const {service} = persistence();
        const entered = deferred<void>();
        const release = deferred<any>();
        service.create.mockImplementationOnce(async data => { entered.resolve(); return release.promise; });
        const identifier = randomUUID();
        const first = agent({sessionService: service}, identifier);
        const second = agent({sessionService: service}, identifier);
        const sessionId = randomUUID();
        const running = first.startSession({sessionId});
        await entered.promise;
        await expect(second.startSession({sessionId})).rejects.toMatchObject({code: "SESSION_BUSY"});
        await expect(second.sendMessage({sessionId, message: "concurrent"})).rejects.toMatchObject({code: "SESSION_BUSY"});
        release.resolve({_id: randomUUID()});
        await running;
        await expect(first.sendMessage({message: "fresh"})).resolves.toMatchObject({message: "final"});
    });

    test("keeps process ownership claims after clearSessions even without persistence", async () => {
        const identifier = randomUUID();
        const router = new Router(identifier).configure({sessionService: false});
        const session = await router.startSession({userId: "user", tenantId: "tenant"});
        router.clearSessions();
        for (const other of [agent({}, identifier), new Router(randomUUID()).configure({sessionService: false})]) {
            await expect(other.startSession({sessionId: session.id, userId: "user", tenantId: "tenant"})).rejects.toMatchObject({code: "SESSION_ACCESS_DENIED"});
        }
        await expect(new Router(identifier).configure({sessionService: false}).startSession({sessionId: session.id, userId: "user", tenantId: null})).rejects.toMatchObject({code: "SESSION_ACCESS_DENIED"});
    });

    test.each([
        {userId: null, tenantId: null}, {userId: "other", tenantId: "tenant"},
        {userId: "user", tenantId: null}, {userId: null, tenantId: "tenant"},
        {userId: "user", tenantId: "other"},
    ])("rejects a warm scope mismatch without creating a replacement: %j", async scope => {
        const {service} = persistence();
        const specialist = agent({sessionService: service});
        const session = await specialist.startSession({userId: "user", tenantId: "tenant"});
        await expect(specialist.startSession({sessionId: session.id, ...scope})).rejects.toMatchObject({code: "SESSION_ACCESS_DENIED"});
        await expect(specialist.sendMessage({sessionId: session.id, message: "hello", ...scope})).rejects.toMatchObject({code: "SESSION_ACCESS_DENIED"});
        expect(() => specialist.getSession({sessionId: session.id, ...scope})).toThrow(DraxAgentError);
        expect(service.create).toHaveBeenCalledOnce();
        expect(service.updatePartial).not.toHaveBeenCalled();
    });

    test.each([
        [{user: "user", tenant: "tenant"}, {userId: null, tenantId: null}],
        [{user: null, tenant: null}, {userId: "user", tenantId: "tenant"}],
        [{user: {_id: "user"}, tenant: {_id: "tenant"}}, {userId: "user", tenantId: null}],
        [{user: "user", tenant: "tenant"}, {userId: "user", tenantId: "other"}],
        [{user: "anonymous", tenant: "global"}, {userId: null, tenantId: null}],
    ])("checks exact persisted user/tenant including null, never scope-filtering: %j", async (relations, inputScope) => {
        const record = stored(relations);
        const {service} = persistence([record]);
        const specialist = agent({sessionService: service});
        await expect(specialist.startSession({sessionId: record.sessionId, ...inputScope})).rejects.toMatchObject({code: "SESSION_ACCESS_DENIED"});
        expect(service.findBy).toHaveBeenCalledWith("sessionId", record.sessionId, 2);
        expect(service.create).not.toHaveBeenCalled();
    });

    test.each([
        {ownerAgentIdentifier: "other", conversationType: "specialist"},
        {ownerAgentIdentifier: "owner", conversationType: "router"},
        {ownerAgentIdentifier: "owner"}, {conversationType: "specialist"},
    ])("rejects cold owner/type mismatch and incomplete ownership metadata: %j", async ownership => {
        const record = stored(ownership);
        const {service} = persistence([record]);
        await expect(agent({sessionService: service}, "owner").sendMessage({sessionId: record.sessionId, message: "hello"})).rejects.toMatchObject({code: "SESSION_ACCESS_DENIED"});
        expect(service.create).not.toHaveBeenCalled();
        expect(service.updatePartial).not.toHaveBeenCalled();
    });

    test("checks persisted router ownership on cold reads with no previous in-process claim", async () => {
        const identifier = randomUUID();
        const record = stored({ownerAgentIdentifier: identifier, conversationType: "router", user: {_id: "user"}, tenant: {id: "tenant"}});
        const {service} = persistence([record]);
        await expect(agent({sessionService: service}, identifier).startSession({sessionId: record.sessionId, userId: "user", tenantId: "tenant"})).rejects.toMatchObject({code: "SESSION_ACCESS_DENIED"});
        const router = new Router(identifier).configure({sessionService: service});
        await expect(router.startSession({sessionId: record.sessionId, userId: "user", tenantId: "tenant"})).resolves.toMatchObject({conversationType: "router", ownerAgentIdentifier: identifier});
        expect(service.create).not.toHaveBeenCalled();
    });

    test("allows legacy specialist sessions but routers cannot adopt legacy history", async () => {
        const record = stored({messages: [{role: "user", content: "legacy"}, {role: "tool", content: "ignored"}]});
        const {service} = persistence([record]);
        await expect(new Router(randomUUID()).configure({sessionService: service}).startSession({sessionId: record.sessionId})).rejects.toMatchObject({code: "SESSION_ACCESS_DENIED"});
        const specialist = agent({sessionService: service});
        const session = await specialist.startSession({sessionId: record.sessionId});
        expect(session.messages).toEqual([{role: "user", content: "legacy"}]);
        expect(session.ownerAgentIdentifier).toBeUndefined();
        expect(session.conversationType).toBeUndefined();
        await specialist.sendMessage({sessionId: session.id, message: "next"});
        expect(service.create).not.toHaveBeenCalled();
        expect(service.updatePartial.mock.calls[0][1].ownerAgentIdentifier).toBeUndefined();
    });

    test("rejects ambiguous persisted session ids instead of picking an owner", async () => {
        const first = stored();
        const second = stored({sessionId: first.sessionId});
        const {service} = persistence([first, second]);
        await expect(agent({sessionService: service}).startSession({sessionId: first.sessionId})).rejects.toMatchObject({code: "SESSION_CONFLICT", statusCode: 409});
        expect(service.create).not.toHaveBeenCalled();
    });

    test("includes the generated sessionId on a first-turn persistence failure after authorized resolution", async () => {
        const {service, records} = persistence();
        const mock = provider();
        const execute = vi.fn(async () => ({completed: true}));
        mock.prompt.mockImplementationOnce(async input => {
            await input.tools![0].execute({});
            return response;
        });
        const specialist = agent({provider: mock, sessionService: service, access: {requireUser: true},
            tools: [{name: "side-effect", description: "side effect", parameters: {}, execute}]});
        service.updatePartial.mockRejectedValueOnce(new Error("secret database details"));
        const error = await specialist.sendMessage({message: "first", userId: "user", tenantId: "tenant", accessContext}).catch(error => error);
        const record = [...records.values()][0];
        expect(error).toBeInstanceOf(DraxAgentError);
        expect(error).toMatchObject({code: "SESSION_PERSISTENCE_INDETERMINATE", sessionId: record.sessionId,
            correlationId: expect.any(String), operationMayHaveCompleted: true, stage: "persistence"});
        expect(error.sessionId).toMatch(/^[0-9a-f-]{36}$/);
        expect(execute).toHaveBeenCalledOnce();
        expect(error.message).not.toContain("secret database details");
        specialist.clearSessions();
        for (const denied of [
            {...accessContext, userId: "other"}, {...accessContext, tenantId: "other"},
        ]) {
            const failure = await specialist.sendMessage({message: "denied", sessionId: error.sessionId,
                userId: denied.userId, tenantId: denied.tenantId, accessContext: denied}).catch(error => error);
            expect(failure).toMatchObject({code: "SESSION_ACCESS_DENIED"});
            expect(failure.sessionId).toBeUndefined();
        }
        const wrongOwner = await agent({sessionService: service}, "other-owner")
            .startSession({sessionId: error.sessionId, userId: "user", tenantId: "tenant", accessContext}).catch(error => error);
        expect(wrongOwner).toMatchObject({code: "SESSION_ACCESS_DENIED"});
        expect(wrongOwner.sessionId).toBeUndefined();
        await expect(specialist.sendMessage({message: "do not replay", sessionId: error.sessionId,
            userId: "user", tenantId: "tenant", accessContext})).rejects.toMatchObject({
            code: "SESSION_PERSISTENCE_INDETERMINATE", sessionId: error.sessionId,
        });
        expect(mock.prompt).toHaveBeenCalledOnce();
        expect(service.create).toHaveBeenCalledOnce();
    });

    test("attaches only the resolved session id to downstream errors and never exposes it on denials", async () => {
        const mock = provider();
        const specialist = agent({provider: mock});
        const session = await specialist.startSession({userId: "user"});
        mock.prompt.mockRejectedValueOnce(new DraxAgentError({code: "PROVIDER_FAILED", message: "Safe failure.",
            statusCode: 502, sessionId: "unrelated-private-session"}));
        await expect(specialist.sendMessage({message: "hello", sessionId: session.id, userId: "user"})).rejects.toMatchObject({
            code: "PROVIDER_FAILED", sessionId: session.id,
        });
        const scopeDenied = await specialist.sendMessage({message: "hello", sessionId: session.id, userId: "other"}).catch(error => error);
        expect(scopeDenied).toMatchObject({code: "SESSION_ACCESS_DENIED", correlationId: expect.any(String)});
        expect(scopeDenied.sessionId).toBeUndefined();
        specialist.configure({access: {requireUser: true}});
        const agentDenied = await specialist.sendMessage({message: "hello", sessionId: session.id}).catch(error => error);
        expect(agentDenied).toMatchObject({code: "AGENT_ACCESS_DENIED"});
        expect(agentDenied.sessionId).toBeUndefined();
        const {service} = persistence();
        service.findBy.mockRejectedValueOnce(new Error("lookup failed"));
        const unresolved = await agent({sessionService: service}).sendMessage({message: "hello", sessionId: "unresolved"}).catch(error => error);
        expect(unresolved.sessionId).toBeUndefined();
    });

    test("reports post-provider persistence failure as indeterminate, never retries or caches false success", async () => {
        const {service} = persistence();
        const mock = provider();
        const identifier = randomUUID();
        const specialist = agent({provider: mock, sessionService: service}, identifier);
        const session = await specialist.startSession();
        service.updatePartial.mockRejectedValueOnce(new Error("secret database details"));
        const operation = specialist.sendMessage({sessionId: session.id, message: "hello"});
        await expect(operation).rejects.toMatchObject({code: "SESSION_PERSISTENCE_INDETERMINATE", stage: "persistence",
            statusCode: 500, correlationId: expect.any(String), sessionId: session.id, operationMayHaveCompleted: true,
            message: "The turn ran but its persistence could not be confirmed. Do not retry this operation."});
        expect(mock.prompt).toHaveBeenCalledOnce();
        expect(service.updatePartial).toHaveBeenCalledOnce();
        expect(session.messages).toEqual([]);
        specialist.clearSessions();
        const other = agent({provider: mock, sessionService: service}, identifier);
        await expect(other.sendMessage({sessionId: session.id, message: "retry"})).rejects.toMatchObject({code: "SESSION_PERSISTENCE_INDETERMINATE", operationMayHaveCompleted: true});
        expect(mock.prompt).toHaveBeenCalledOnce();
        expect(service.updatePartial).toHaveBeenCalledOnce();
    });

    test.each(["missing update acknowledgement", "missing usage record", "usage lookup failure"])(
        "never reports success after a turn if persistence has %s", async failure => {
            const {service} = persistence();
            const mock = provider();
            const specialist = agent({provider: mock, sessionService: service});
            const session = await specialist.startSession();
            if (failure === "missing update acknowledgement") {
                service.updatePartial.mockResolvedValueOnce(null);
            } else if (failure === "missing usage record") {
                service.findById.mockResolvedValueOnce(null);
            } else {
                service.findById.mockRejectedValueOnce(new Error("secret usage lookup failure"));
            }
            await expect(specialist.sendMessage({sessionId: session.id, message: "hello"})).rejects.toMatchObject({
                code: "SESSION_PERSISTENCE_INDETERMINATE", stage: "persistence", operationMayHaveCompleted: true,
            });
            expect(mock.prompt).toHaveBeenCalledOnce();
            expect(session.messages).toEqual([]);
            expect(service.create).toHaveBeenCalledOnce();
        },
    );

    test("does not call provider after session creation or lookup failures, and releases locks", async () => {
        const {service} = persistence();
        const mock = provider();
        const specialist = agent({provider: mock, sessionService: service});
        const sessionId = randomUUID();
        service.findBy.mockRejectedValueOnce(new Error("secret database"));
        await expect(specialist.sendMessage({sessionId, message: "lookup"})).rejects.toMatchObject({code: "AGENT_MESSAGE_FAILED", stage: "session"});
        service.create.mockRejectedValueOnce(new Error("secret database"));
        await expect(specialist.sendMessage({sessionId, message: "create"})).rejects.toMatchObject({stage: "session"});
        expect(mock.prompt).not.toHaveBeenCalled();
        await expect(specialist.sendMessage({sessionId, message: "after"})).resolves.toMatchObject({message: "final"});
        expect(mock.prompt).toHaveBeenCalledOnce();
    });
});
