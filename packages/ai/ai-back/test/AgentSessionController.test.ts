import {randomUUID} from "node:crypto";
import fs from "node:fs";
import {syncBuiltinESMExports} from "node:module";
import {Readable, Writable} from "node:stream";
import Fastify, {type FastifyInstance} from "fastify";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";
import {AgentSessionBaseSchema} from "../src/schemas/AgentSessionSchema.js";
import type {IPromptResponse} from "../src/interfaces/IAIProvider.js";

const database = vi.hoisted(() => ({
    records: new Map<string, any>(),
    service: {create: vi.fn(), findBy: vi.fn(), findById: vi.fn(), find: vi.fn(),
        update: vi.fn(), updatePartial: vi.fn(), delete: vi.fn(), parseImport: vi.fn()},
}));
// Preserve common error class identity across cold-agent module resets.
vi.mock("@drax/common-back", async importOriginal => await importOriginal());
// Keep the real base controller stable across cold-agent module resets (its barrel registers Mongoose models).
vi.mock("@drax/crud-back", async importOriginal => {
    return await importOriginal<typeof import("@drax/crud-back")>();
});

vi.mock("../src/factory/services/AgentSessionServiceFactory.js", () => ({default: {get instance() { return database.service; }}}));
vi.mock("../src/factory/ai/AiProviderFactory.js", () => ({default: {instance: () => { throw new Error("Unexpected provider access"); }}}));

const servers: FastifyInstance[] = [];
const prefix = "/api/agentsession";
const scope = {userId: "user", tenantId: "tenant"};
const response: IPromptResponse = {output: "final", tokens: 3, inputTokens: 2, outputTokens: 1, time: 1};

function relation(value: any, label: string) {
    return value == null ? null : typeof value === "object" ? value : {_id: value, [label]: value};
}

function save(data: any) {
    const record = {_id: randomUUID(), sessionId: randomUUID(), user: {_id: "user", username: "user"},
        tenant: {_id: "tenant", name: "tenant"}, createdAt: new Date(), updatedAt: new Date(), ...structuredClone(data)};
    record.user = relation(record.user, "username");
    record.tenant = relation(record.tenant, "name");
    database.records.set(record._id, record);
    return structuredClone(record);
}

async function server() {
    const {default: routes} = await import("../src/routes/AgentSessionRoutes.js");
    const app = Fastify();
    servers.push(app);
    app.addHook("onRequest", async request => {
        (request as any).rbac = {
            ...scope, username: "user", hasTenant: true,
            assertPermission: vi.fn(), hasSomePermission: () => false,
            assertUserId: (id: string) => { if (id !== scope.userId) { throw new Error("Wrong user"); } },
            assertTenantId: (id: string) => { if (id !== scope.tenantId) { throw new Error("Wrong tenant"); } },
        };
    });
    // In-memory uploads exercise the real JSON/CSV handlers without disk or multipart dependencies.
    app.addHook("preValidation", async request => {
        if (request.url.startsWith(`${prefix}/import`)) {
            const csv = request.url.includes("format=CSV");
            (request as any).file = async () => ({filename: csv ? "sessions.csv" : "sessions.json",
                file: Readable.from([csv ? request.body : JSON.stringify(request.body)])});
        }
    });
    await app.register(routes);
    await app.ready();
    return app;
}

function createRequest(channel: "create" | "JSON" | "CSV", sessionId: string) {
    if (channel === "create") {
        return {method: "POST" as const, url: prefix, payload: {sessionId}};
    }
    if (channel === "CSV") {
        return {method: "POST" as const, url: `${prefix}/import?format=CSV`,
            headers: {"content-type": "text/plain"}, payload: `sessionId\n${sessionId}`};
    }
    return {method: "POST" as const, url: `${prefix}/import?format=JSON`, payload: [{sessionId}]};
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(done => { resolve = done; });
    return {promise, resolve};
}

beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    database.records.clear();
    // The installed CRUD package is externalized: intercept its native report I/O, not its parser.
    const mkdirSync = fs.mkdirSync;
    vi.spyOn(fs, "mkdirSync").mockImplementation(((path: any, options: any) =>
        String(path).startsWith("files/imports") ? undefined : mkdirSync(path, options)) as any);
    vi.spyOn(fs, "createWriteStream").mockImplementation(() => new Writable({
        write(_chunk, _encoding, callback) { callback(); },
    }) as any);
    syncBuiltinESMExports();
    database.service.create.mockImplementation(async data => save(AgentSessionBaseSchema.parse(data)));
    database.service.findBy.mockImplementation(async (_field, sessionId, limit) =>
        structuredClone([...database.records.values()].filter(record => record.sessionId === sessionId).slice(0, limit)));
    database.service.findById.mockImplementation(async id => structuredClone(database.records.get(id) ?? null));
    database.service.find.mockImplementation(async () => structuredClone([...database.records.values()]));
    const update = async (id: string, data: any) => save({...database.records.get(id), ...structuredClone(data), _id: id});
    database.service.update.mockImplementation(update);
    database.service.updatePartial.mockImplementation(update);
    database.service.delete.mockImplementation(async id => database.records.delete(id));
    database.service.parseImport.mockImplementation(({content}) => JSON.parse(content));
});

afterEach(async () => {
    await Promise.all(servers.splice(0).map(app => app.close()));
    vi.restoreAllMocks();
    syncBuiltinESMExports();
});

describe("AgentSession CRUD HTTP ownership boundary", () => {
    test.each(["PUT", "PATCH"] as const)("rejects the identity/owner promotion bypass through %s after a cold claims reset", async method => {
        const {DraxAgent: InitialAgent} = await import("../src/agents/DraxAgent.js");
        const initial = new InitialAgent("manual").configure({sessionService: database.service as any});
        const session = await initial.startSession(scope);
        const record = [...database.records.values()][0];
        initial.clearSessions();
        // Simulate a process restart, not merely clearing the per-instance cache.
        vi.resetModules();
        const {DraxAgent} = await import("../src/agents/DraxAgent.js");
        expect(DraxAgent.isSessionProtected(session.id)).toBe(false);
        const app = await server();
        const alternateId = randomUUID();
        const result = await app.inject({method, url: `${prefix}/${record._id}`, payload: {
            sessionId: alternateId, ownerAgentIdentifier: "auto", conversationType: "router", messages: [],
        }});
        expect(result.statusCode).toBe(403);
        expect(database.records.get(record._id)).toEqual(record);
        expect(database.service.update).not.toHaveBeenCalled();
        expect(database.service.updatePartial).not.toHaveBeenCalled();
        class Router extends DraxAgent { override get type(): "router" { return "router"; } }
        const router = new Router("auto").configure({sessionService: database.service as any});
        await expect(router.startSession({sessionId: session.id, ...scope})).rejects.toMatchObject({code: "SESSION_ACCESS_DENIED"});
        expect(database.service.create).toHaveBeenCalledOnce();
    });

    test.each([
        {ownerAgentIdentifier: "manual", conversationType: "specialist"},
        {ownerAgentIdentifier: "auto", conversationType: "router"},
        {ownerAgentIdentifier: "partial"}, {conversationType: "router"},
    ])("managed or incomplete ownership remains read-only for all HTTP mutations: %j", async ownership => {
        const record = save({...ownership, title: "original", messages: [{role: "user", content: "original"}]});
        const app = await server();
        for (const method of ["PUT", "PATCH", "DELETE"] as const) {
            const result = await app.inject({method, url: `${prefix}/${record._id}`,
                ...(method !== "DELETE" ? {payload: {sessionId: record.sessionId, title: "edited", messages: []}} : {})});
            expect(result.statusCode).toBe(403);
        }
        expect(database.records.get(record._id)).toEqual(record);
        expect(database.service.update).not.toHaveBeenCalled();
        expect(database.service.updatePartial).not.toHaveBeenCalled();
        expect(database.service.delete).not.toHaveBeenCalled();
    });

    test.each(["PUT", "PATCH"] as const)("rejects managed history edits through %s while a provider is running", async method => {
        const {DraxAgent} = await import("../src/agents/DraxAgent.js");
        const entered = deferred<void>();
        const release = deferred<IPromptResponse>();
        const provider = {prompt: vi.fn(() => { entered.resolve(); return release.promise; })};
        const agent = new DraxAgent("auto").configure({provider, sessionService: database.service as any});
        const session = await agent.startSession(scope);
        const record = [...database.records.values()][0];
        const app = await server();
        const running = agent.sendMessage({sessionId: session.id, message: "real user", ...scope});
        await entered.promise;
        try {
            const edit = await app.inject({method, url: `${prefix}/${record._id}`, payload: {
                sessionId: record.sessionId, messages: [{role: "assistant", content: "forged"}],
            }});
            expect(edit.statusCode).toBe(403);
            expect(database.records.get(record._id).messages).toEqual([]);
            expect(database.service.updatePartial).not.toHaveBeenCalled();
        } finally {
            release.resolve(response);
            await running;
        }
        expect(database.records.get(record._id).messages.map((message: any) => message.content)).toEqual(["real user", "final"]);
    });

    test("also protects a claimed legacy conversation during a turn and after clearing local caches", async () => {
        const record = save({messages: [{role: "user", content: "legacy"}]});
        const {DraxAgent} = await import("../src/agents/DraxAgent.js");
        const agent = new DraxAgent("manual").configure({sessionService: database.service as any});
        await agent.startSession({sessionId: record.sessionId, ...scope});
        agent.clearSessions();
        const app = await server();
        const edit = await app.inject({method: "PATCH", url: `${prefix}/${record._id}`, payload: {sessionId: record.sessionId, messages: []}});
        expect(edit.statusCode).toBe(403);
        const remove = await app.inject({method: "DELETE", url: `${prefix}/${record._id}`});
        expect(remove.statusCode).toBe(403);
        expect(database.records.get(record._id)).toEqual(record);
    });

    test.each(["PUT", "PATCH", "DELETE"] as const)("blocks %s on legacy history while resolution is in flight, before a claim exists", async method => {
        const record = save({messages: [{role: "user", content: "legacy"}]});
        const {DraxAgent} = await import("../src/agents/DraxAgent.js");
        const app = await server();
        const entered = deferred<void>();
        const release = deferred<any[]>();
        database.service.findBy.mockImplementationOnce(() => { entered.resolve(); return release.promise; });
        const agent = new DraxAgent("manual").configure({sessionService: database.service as any});
        const running = agent.startSession({sessionId: record.sessionId, ...scope});
        await entered.promise;
        try {
            const result = await app.inject({method, url: `${prefix}/${record._id}`,
                ...(method === "DELETE" ? {} : {payload: {sessionId: record.sessionId, messages: []}})});
            expect(result.statusCode).toBe(403);
            expect(database.records.get(record._id)).toEqual(record);
            expect(database.service.update).not.toHaveBeenCalled();
            expect(database.service.updatePartial).not.toHaveBeenCalled();
            expect(database.service.delete).not.toHaveBeenCalled();
        } finally {
            release.resolve([record]);
            await running;
        }
    });

    test("keeps list/get available for managed sessions", async () => {
        const record = save({ownerAgentIdentifier: "auto", conversationType: "router", title: "readable"});
        const app = await server();
        const get = await app.inject({method: "GET", url: `${prefix}/${record._id}`});
        expect(get.statusCode).toBe(200);
        expect(get.json()).toMatchObject({sessionId: record.sessionId, ownerAgentIdentifier: "auto", conversationType: "router"});
        const list = await app.inject({method: "GET", url: `${prefix}/find`});
        expect(list.statusCode).toBe(200);
        expect(list.json()).toEqual([get.json()]);
    });

    test.each(["PUT", "PATCH"] as const)("allows safe, unclaimed legacy edits through %s with the same sessionId", async method => {
        const record = save({title: "old", messages: [{role: "user", content: "legacy"}]});
        const app = await server();
        const edit = await app.inject({method, url: `${prefix}/${record._id}`, payload: {
            sessionId: record.sessionId, title: "new", messages: [{role: "user", content: "safe edit"}],
        }});
        expect(edit.statusCode).toBe(200);
        expect(database.records.get(record._id)).toMatchObject({sessionId: record.sessionId, title: "new",
            messages: [{role: "user", content: "safe edit"}]});
        expect(database.records.get(record._id)).not.toHaveProperty("ownerAgentIdentifier");
        expect(database.records.get(record._id)).not.toHaveProperty("conversationType");
        const remove = await app.inject({method: "DELETE", url: `${prefix}/${record._id}`});
        expect(remove.statusCode).toBe(200);
        expect(database.records.has(record._id)).toBe(false);
    });

    test.each(["PUT", "PATCH"] as const)("forbids changing legacy session identity through %s", async method => {
        const record = save({title: "legacy"});
        const app = await server();
        const edit = await app.inject({method, url: `${prefix}/${record._id}`, payload: {sessionId: randomUUID(), title: "rename"}});
        expect(edit.statusCode).toBe(400);
        expect(database.records.get(record._id)).toEqual(record);
        expect(database.service.update).not.toHaveBeenCalled();
        expect(database.service.updatePartial).not.toHaveBeenCalled();
    });

    test.each(["ownerAgentIdentifier", "conversationType", "lastResolvedAgentIdentifier"])(
        "rejects legacy promotion and HTTP creation with reserved %s", async field => {
            const record = save({title: "legacy"});
            const app = await server();
            const value = field === "conversationType" ? "router" : "auto";
            for (const method of ["PUT", "PATCH"] as const) {
                const edit = await app.inject({method, url: `${prefix}/${record._id}`, payload: {sessionId: record.sessionId, [field]: value}});
                expect(edit.statusCode).toBe(400);
            }
            const create = await app.inject({method: "POST", url: prefix, payload: {sessionId: randomUUID(), [field]: value}});
            expect(create.statusCode).toBe(400);
            expect(database.records.get(record._id)).toEqual(record);
            expect(database.records.size).toBe(1);
        },
    );

    test("allows creation of a new legacy identifier but rejects collision with any persisted scope or active claim", async () => {
        const app = await server();
        const id = randomUUID();
        const created = await app.inject({method: "POST", url: prefix, payload: {sessionId: id, title: "legacy"}});
        expect(created.statusCode).toBe(200);
        expect(created.json()).toMatchObject({sessionId: id, title: "legacy"});
        expect(created.json()).not.toHaveProperty("ownerAgentIdentifier");
        const managed = save({ownerAgentIdentifier: "auto", conversationType: "router", user: "other", tenant: null});
        for (const sessionId of [id, managed.sessionId]) {
            const collision = await app.inject({method: "POST", url: prefix, payload: {sessionId}});
            expect(collision.statusCode).toBe(403);
        }
        const {DraxAgent} = await import("../src/agents/DraxAgent.js");
        const claimed = await new DraxAgent("manual").configure({sessionService: false}).startSession(scope);
        const collision = await app.inject({method: "POST", url: prefix, payload: {sessionId: claimed.id}});
        expect(collision.statusCode).toBe(403);
        expect(database.service.create).toHaveBeenCalledOnce();
        expect(database.service.findBy).toHaveBeenCalledWith("sessionId", managed.sessionId, 1);
    });

    test("JSON import guards every row and cannot promote, replace or forge managed sessions", async () => {
        const managed = save({ownerAgentIdentifier: "manual", conversationType: "specialist"});
        const app = await server();
        const safeId = randomUUID();
        const result = await app.inject({method: "POST", url: `${prefix}/import?format=JSON`, payload: [
            {sessionId: randomUUID(), ownerAgentIdentifier: "auto", conversationType: "router"},
            {sessionId: managed.sessionId},
            {sessionId: randomUUID(), lastResolvedAgentIdentifier: "auto"},
            {_id: managed._id, sessionId: randomUUID()},
            {sessionId: safeId, title: "safe import", messages: [{role: "user", content: "legacy"}]},
        ]});
        expect(result.statusCode).toBe(200);
        expect(result.json()).toMatchObject({rowCount: 5, successCount: 1, errorCount: 4});
        expect(database.records.get(managed._id)).toEqual(managed);
        expect(database.records.size).toBe(2);
        expect(database.service.create).toHaveBeenCalledOnce();
        const imported = [...database.records.values()].find(record => record.sessionId === safeId);
        expect(imported).toMatchObject({title: "safe import", user: {_id: "user"}, tenant: {_id: "tenant"}});
    });

    test.each(["ownerAgentIdentifier", "conversationType", "lastResolvedAgentIdentifier", "_id", "id"])(
        "CSV import rejects reserved %s on every row", async field => {
            const app = await server();
            const content = `sessionId;${field}\n${randomUUID()};${field === "conversationType" ? "router" : "private"}`;
            const result = await app.inject({method: "POST", url: `${prefix}/import?format=CSV`,
                headers: {"content-type": "text/plain"}, payload: content});
            expect(result.statusCode).toBe(200);
            expect(result.json()).toMatchObject({rowCount: 1, successCount: 0, errorCount: 1});
            expect(database.service.create).not.toHaveBeenCalled();
        },
    );

    test.each([
        {header: "__proto__", separator: ";", prefix: ""},
        {header: "__proto__.ownerAgentIdentifier", separator: ";", prefix: "\r\n;\r\n"},
        {header: "constructor.prototype.conversationType", separator: ";"},
        {header: '"__proto__.lastResolvedAgentIdentifier"', separator: ","},
    ])("CSV import rejects prototype header $header before the shared parser can assign it", async ({header, separator, prefix: emptyRecords = ""}) => {
        const app = await server();
        const result = await app.inject({method: "POST", url: `${prefix}/import?format=CSV&separator=${encodeURIComponent(separator)}`,
            headers: {"content-type": "text/plain"},
            payload: `${emptyRecords}sessionId${separator}${header}\r\n${randomUUID()}${separator}auto`});
        expect(result.statusCode).toBe(400);
        expect(database.service.create).not.toHaveBeenCalled();
        expect(database.service.findBy).not.toHaveBeenCalled();
        for (const field of ["ownerAgentIdentifier", "conversationType", "lastResolvedAgentIdentifier"]) {
            expect(Object.prototype).not.toHaveProperty(field);
        }
    });

    test.each([";", ","])("safe quoted CSV headers and values still import with separator %s", async separator => {
        const app = await server();
        const id = randomUUID();
        const result = await app.inject({method: "POST", url: `${prefix}/import?format=CSV&separator=${encodeURIComponent(separator)}`,
            headers: {"content-type": "text/plain"},
            payload: `\r\n"sessionId"${separator}"title"\r\n${id}${separator}"safe${separator} ""legacy"""`});
        expect(result.statusCode).toBe(200);
        expect(result.json()).toMatchObject({rowCount: 1, successCount: 1, errorCount: 0});
        expect([...database.records.values()][0]).toMatchObject({sessionId: id, title: `safe${separator} "legacy"`});
    });

    test("CSV import checks persisted collisions, claims, in-flight lookups and duplicate rows", async () => {
        const persisted = save({user: "other", tenant: null});
        const {DraxAgent} = await import("../src/agents/DraxAgent.js");
        const claimed = await new DraxAgent("manual").configure({sessionService: false}).startSession(scope);
        const entered = deferred<void>();
        const release = deferred<any[]>();
        database.service.findBy.mockImplementationOnce(() => { entered.resolve(); return release.promise; });
        const inFlight = randomUUID();
        const running = new DraxAgent("manual").configure({sessionService: database.service as any})
            .startSession({sessionId: inFlight, ...scope});
        await entered.promise;
        const app = await server();
        const safeId = randomUUID();
        try {
            const result = await app.inject({method: "POST", url: `${prefix}/import?format=CSV`,
                headers: {"content-type": "text/plain"}, payload: ["sessionId;title",
                    `${persisted.sessionId};collision`, `${claimed.id};claimed`, `${inFlight};in-flight`,
                    `${safeId};safe`, `${safeId};duplicate`].join("\n")});
            expect(result.statusCode).toBe(200);
            expect(result.json()).toMatchObject({rowCount: 5, successCount: 1, errorCount: 4});
            expect(database.service.parseImport).not.toHaveBeenCalled();
            expect(database.service.create).toHaveBeenCalledOnce();
            expect(database.records.get(persisted._id)).toEqual(persisted);
            expect([...database.records.values()].find(record => record.sessionId === safeId))
                .toMatchObject({title: "safe", user: {_id: "user"}, tenant: {_id: "tenant"}});
        } finally {
            release.resolve([]);
            await running;
        }
    });

    test.each(["create", "JSON", "CSV"] as const)("%s reserves the id through the real insert, excluding a concurrent router", async channel => {
        const {DraxAgent} = await import("../src/agents/DraxAgent.js");
        class Router extends DraxAgent { override get type(): "router" { return "router"; } }
        const originalCreate = database.service.create;
        const app = await server();
        const sessionId = randomUUID();
        const entered = deferred<void>();
        const release = deferred<void>();
        database.service.create.mockImplementationOnce(async data => {
            entered.resolve();
            await release.promise;
            return save(AgentSessionBaseSchema.parse(data));
        });
        const running = app.inject(createRequest(channel, sessionId)).then(result => result);
        await entered.promise;
        const router = new Router("auto").configure({sessionService: database.service as any});
        try {
            const lookupCount = database.service.findBy.mock.calls.length;
            await expect(router.startSession({sessionId, ...scope})).rejects.toMatchObject({code: "SESSION_BUSY", statusCode: 409});
            expect(database.service.findBy).toHaveBeenCalledTimes(lookupCount);
            expect(database.service.create).toHaveBeenCalledOnce();
            expect(database.records.size).toBe(0);
            expect(database.service.create).toBe(originalCreate);
        } finally {
            release.resolve();
            await running;
        }
        const result = await running;
        expect(result.statusCode).toBe(200);
        if (channel !== "create") {
            expect(result.json()).toMatchObject({successCount: 1, errorCount: 0});
        }
        expect([...database.records.values()].filter(record => record.sessionId === sessionId)).toHaveLength(1);
        await expect(router.startSession({sessionId, ...scope})).rejects.toMatchObject({code: "SESSION_ACCESS_DENIED"});
        expect(database.service.create).toHaveBeenCalledOnce();
    });

    test.each(["create", "JSON", "CSV"] as const)("a competing %s mutation from another controller fails fast while an insert is reserved", async channel => {
        const originalCreate = database.service.create;
        const first = await server();
        const second = await server();
        const sessionId = randomUUID();
        const entered = deferred<void>();
        const release = deferred<void>();
        database.service.create.mockImplementationOnce(async data => {
            entered.resolve();
            await release.promise;
            return save(AgentSessionBaseSchema.parse(data));
        });
        const running = first.inject(createRequest("create", sessionId)).then(result => result);
        await entered.promise;
        try {
            const competing = await second.inject(createRequest(channel, sessionId));
            if (channel === "create") {
                expect(competing.statusCode).toBe(409);
                expect(competing.json().error.code).toBe("SESSION_BUSY");
                expect(competing.json()).not.toHaveProperty("sessionId");
            } else {
                expect(competing.statusCode).toBe(200);
                expect(competing.json()).toMatchObject({successCount: 0, errorCount: 1});
            }
            expect(database.service.create).toHaveBeenCalledOnce();
            expect(database.service.create).toBe(originalCreate);
            const independent = await second.inject(createRequest("create", randomUUID()));
            expect(independent.statusCode).toBe(200);
        } finally {
            release.resolve();
            await running;
        }
        expect((await running).statusCode).toBe(200);
        expect([...database.records.values()].filter(record => record.sessionId === sessionId)).toHaveLength(1);
    });

    test.each(["create", "JSON", "CSV"] as const)("core-first reservation/claim prevents a %s insert without wrapping the service singleton", async channel => {
        const {DraxAgent} = await import("../src/agents/DraxAgent.js");
        class Router extends DraxAgent { override get type(): "router" { return "router"; } }
        const originalCreate = database.service.create;
        const app = await server();
        const sessionId = randomUUID();
        const entered = deferred<void>();
        const release = deferred<void>();
        database.service.create.mockImplementationOnce(async data => {
            entered.resolve();
            await release.promise;
            return save(AgentSessionBaseSchema.parse(data));
        });
        const router = new Router("auto").configure({sessionService: database.service as any});
        const running = router.startSession({sessionId, ...scope});
        await entered.promise;
        try {
            const competing = await app.inject(createRequest(channel, sessionId));
            expect(competing.statusCode).toBe(channel === "create" ? 403 : 200);
            if (channel !== "create") {
                expect(competing.json()).toMatchObject({successCount: 0, errorCount: 1});
            }
            expect(database.service.create).toHaveBeenCalledOnce();
            expect(database.service.create).toBe(originalCreate);
        } finally {
            release.resolve();
            await running;
        }
        expect([...database.records.values()].filter(record => record.sessionId === sessionId)).toHaveLength(1);
        expect([...database.records.values()][0]).toMatchObject({ownerAgentIdentifier: "auto", conversationType: "router"});
        router.clearSessions();
        const retry = await app.inject(createRequest(channel, sessionId));
        expect(retry.statusCode).toBe(channel === "create" ? 403 : 200);
        expect(database.service.create).toHaveBeenCalledOnce();
    });

    test.each(["create", "JSON", "CSV"] as const)("%s revalidates a core claim acquired after the outer preCreate hook", async channel => {
        const {DraxAgent} = await import("../src/agents/DraxAgent.js");
        const {AgentSessionController} = await import("../src/controllers/AgentSessionController.js");
        class Router extends DraxAgent { override get type(): "router" { return "router"; } }
        const router = new Router("auto").configure({sessionService: database.service as any});
        const sessionId = randomUUID();
        const preCreate = AgentSessionController.prototype.preCreate;
        vi.spyOn(AgentSessionController.prototype, "preCreate").mockImplementationOnce(async function(request, payload) {
            const result = await preCreate.call(this, request, payload);
            await router.startSession({sessionId, ...scope});
            return result;
        });
        const app = await server();
        const result = await app.inject(createRequest(channel, sessionId));
        expect(result.statusCode).toBe(channel === "create" ? 403 : 200);
        if (channel !== "create") {
            expect(result.json()).toMatchObject({successCount: 0, errorCount: 1});
        }
        expect(database.service.create).toHaveBeenCalledOnce();
        expect([...database.records.values()]).toHaveLength(1);
        expect([...database.records.values()][0]).toMatchObject({ownerAgentIdentifier: "auto", conversationType: "router"});
        await expect(DraxAgent.withSessionReservation(sessionId, () => "released")).resolves.toBe("released");
    });

    test.each([
        {method: "PUT", mutation: "update"}, {method: "PATCH", mutation: "updatePartial"}, {method: "DELETE", mutation: "delete"},
    ] as const)("$method reserves legacy identity through the real mutation and excludes core/other controllers", async ({method, mutation}) => {
        const record = save({title: "legacy", messages: [{role: "user", content: "original"}]});
        const {DraxAgent} = await import("../src/agents/DraxAgent.js");
        const app = await server();
        const competingApp = await server();
        const originalMutation = database.service[mutation];
        const entered = deferred<void>();
        const release = deferred<void>();
        database.service[mutation].mockImplementationOnce(async (id: string, data: any) => {
            entered.resolve();
            await release.promise;
            return mutation === "delete" ? database.records.delete(id) : save({...database.records.get(id), ...data, _id: id});
        });
        const running = app.inject({method, url: `${prefix}/${record._id}`,
            ...(method === "DELETE" ? {} : {payload: {sessionId: record.sessionId, title: "edited"}})}).then(result => result);
        await entered.promise;
        const agent = new DraxAgent("manual").configure({sessionService: database.service as any});
        try {
            await expect(agent.startSession({sessionId: record.sessionId, ...scope})).rejects.toMatchObject({code: "SESSION_BUSY", statusCode: 409});
            const competing = await competingApp.inject({method: "PATCH", url: `${prefix}/${record._id}`,
                payload: {sessionId: record.sessionId, title: "must not win"}});
            expect(competing.statusCode).toBe(409);
            expect(competing.json().error.code).toBe("SESSION_BUSY");
            expect(database.records.get(record._id)).toEqual(record);
            expect(database.service[mutation]).toBe(originalMutation);
            expect(database.service[mutation]).toHaveBeenCalledOnce();
        } finally {
            release.resolve();
            await running;
        }
        expect((await running).statusCode).toBe(200);
        if (method !== "DELETE") {
            expect(database.records.get(record._id).title).toBe("edited");
        }
        await expect(agent.startSession({sessionId: record.sessionId, ...scope})).resolves.toMatchObject({id: record.sessionId});
    });

    test.each(["update", "updatePartial", "delete"] as const)("%s re-reads the record inside its reservation and rejects changed ownership/identity or missing records", async mutation => {
        const {DraxAgent} = await import("../src/agents/DraxAgent.js");
        const {AgentSessionController} = await import("../src/controllers/AgentSessionController.js");
        class Controller extends AgentSessionController { get facade() { return this.service; } }
        const controller = new Controller();
        for (const change of ["managed", "identity", "missing", "claimed"] as const) {
            const record = save({title: "legacy"});
            database.service.findById.mockImplementationOnce(async () => {
                if (change === "managed") {
                    save({...record, ownerAgentIdentifier: "auto", conversationType: "router"});
                } else if (change === "identity") {
                    save({...record, sessionId: randomUUID()});
                } else if (change === "missing") {
                    database.records.delete(record._id);
                } else {
                    await new DraxAgent("manual").configure({sessionService: database.service as any})
                        .startSession({sessionId: record.sessionId, ...scope});
                }
                return structuredClone(record);
            });
            await expect(mutation === "delete" ? controller.facade.delete(record._id)
                : controller.facade[mutation](record._id, {sessionId: record.sessionId, title: "forged"}))
                .rejects.toMatchObject({name: change === "missing" ? "NotFoundError" : "ForbiddenError"});
            expect(database.service[mutation]).not.toHaveBeenCalled();
            await expect(DraxAgent.withSessionReservation(record.sessionId, () => "released")).resolves.toBe("released");
        }
    });

    test.each(["update", "updatePartial"] as const)("%s validates payload/session identity inside the facade and releases on validation errors", async mutation => {
        const {DraxAgent} = await import("../src/agents/DraxAgent.js");
        const {AgentSessionController} = await import("../src/controllers/AgentSessionController.js");
        class Controller extends AgentSessionController { get facade() { return this.service; } }
        const controller = new Controller();
        const record = save({title: "legacy"});
        for (const payload of [{sessionId: randomUUID()}, {sessionId: record.sessionId, ownerAgentIdentifier: "auto"}]) {
            await expect(controller.facade[mutation](record._id, payload)).rejects.toMatchObject({name: "BadRequestError"});
            expect(database.service[mutation]).not.toHaveBeenCalled();
            await expect(DraxAgent.withSessionReservation(record.sessionId, () => "released")).resolves.toBe("released");
        }
        await expect(controller.facade[mutation](record._id, {sessionId: record.sessionId, title: "safe"}))
            .resolves.toMatchObject({title: "safe"});
    });

    test("non-mutating facade methods execute with the singleton as receiver", async () => {
        const {AgentSessionController} = await import("../src/controllers/AgentSessionController.js");
        class Controller extends AgentSessionController { get facade() { return this.service; } }
        database.service.findBy.mockImplementationOnce(function() {
            expect(this).toBe(database.service);
            return Promise.resolve([]);
        });
        database.service.parseImport.mockImplementationOnce(function() {
            expect(this).toBe(database.service);
            return [];
        });
        const controller = new Controller();
        await expect(controller.facade.findBy("sessionId", "absent", 1)).resolves.toEqual([]);
        expect(controller.facade.parseImport({format: "JSON", content: "[]"})).toEqual([]);
    });

    test.each([
        {method: "POST", mutation: "create"}, {method: "PUT", mutation: "update"},
        {method: "PATCH", mutation: "updatePartial"}, {method: "DELETE", mutation: "delete"},
    ] as const)("$method releases the reservation when the target mutation rejects", async ({method, mutation}) => {
        const {DraxAgent} = await import("../src/agents/DraxAgent.js");
        const record = method === "POST" ? {sessionId: randomUUID(), _id: "unused"} : save({title: "legacy"});
        const app = await server();
        const request = {method, url: method === "POST" ? prefix : `${prefix}/${record._id}`,
            ...(method === "DELETE" ? {} : {payload: {sessionId: record.sessionId, title: "edit"}})};
        database.service[mutation].mockRejectedValueOnce(new Error("target write failed"));
        const failed = await app.inject(request);
        expect(failed.statusCode).toBe(500);
        await expect(DraxAgent.withSessionReservation(record.sessionId, () => "released")).resolves.toBe("released");
        const retry = await app.inject(request);
        expect(retry.statusCode).toBe(200);
        expect(database.service[mutation]).toHaveBeenCalledTimes(2);
    });

    test.each(["JSON", "CSV"] as const)("%s releases a failed row reservation before importing the next row with the same id", async channel => {
        const app = await server();
        const sessionId = randomUUID();
        database.service.create.mockRejectedValueOnce(new Error("first insert failed without writing"));
        const request = channel === "JSON"
            ? {method: "POST" as const, url: `${prefix}/import?format=JSON`, payload: [{sessionId}, {sessionId}]}
            : {method: "POST" as const, url: `${prefix}/import?format=CSV`, headers: {"content-type": "text/plain"},
                payload: `sessionId\n${sessionId}\n${sessionId}`};
        const result = await app.inject(request);
        expect(result.statusCode).toBe(200);
        expect(result.json()).toMatchObject({rowCount: 2, successCount: 1, errorCount: 1});
        expect(database.service.create).toHaveBeenCalledTimes(2);
        expect([...database.records.values()].filter(record => record.sessionId === sessionId)).toHaveLength(1);
    });

    test("internal services still persist and update owner metadata and history", async () => {
        await server();
        const session = await database.service.create({sessionId: randomUUID(), ownerAgentIdentifier: "auto", conversationType: "router"});
        const updated = await database.service.updatePartial(session._id, {lastResolvedAgentIdentifier: "specialist",
            messages: [{role: "assistant", content: "internal final"}]});
        expect(updated).toMatchObject({ownerAgentIdentifier: "auto", conversationType: "router", lastResolvedAgentIdentifier: "specialist",
            messages: [{role: "assistant", content: "internal final"}]});
    });
});
