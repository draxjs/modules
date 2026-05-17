import {describe, expect, test} from "vitest";
import {DraxAgent} from "../src/agents/DraxAgent.js";
import {DraxAgentFactory} from "../src/factory/DraxAgentFactory.js";
import type {IAIProvider, IPromptParams, IPromptResponse, IPromptTool} from "../src/interfaces/IAIProvider.js";

class MockProvider implements IAIProvider {
    requests: IPromptParams[] = [];

    async prompt(input: IPromptParams): Promise<IPromptResponse> {
        this.requests.push(input);

        if (input.tools && input.tools.length > 0) {
            await input.tools[0].execute({value: "Ada"});
        }

        return {
            output: "respuesta",
            tokens: 10,
            inputTokens: 6,
            outputTokens: 4,
            time: 12,
        };
    }
}

describe("DraxAgent", () => {
    test("factory returns one agent instance per identifier", () => {
        expect(DraxAgentFactory.instance()).toBe(DraxAgentFactory.instance("default"));
        expect(DraxAgentFactory.instance("taskSpecialist")).toBe(DraxAgentFactory.instance("taskSpecialist"));
        expect(DraxAgentFactory.instance("taskSpecialist")).not.toBe(DraxAgentFactory.instance("default"));
        expect(DraxAgentFactory.agents()).toContain(DraxAgentFactory.instance("taskSpecialist"));
        expect(new DraxAgent()).not.toBe(new DraxAgent());
    });

    test("stores agent identifier and description", () => {
        const defaultAgent = new DraxAgent();
        const specialist = DraxAgentFactory.instance("taskSpecialistWithDescription", "Resuelve tareas especificas");

        expect(defaultAgent.identifier).toBe("default");
        expect(defaultAgent.description).toBe("");
        expect(specialist.identifier).toBe("taskSpecialistWithDescription");
        expect(specialist.description).toBe("Resuelve tareas especificas");
        expect(DraxAgentFactory.instance("taskSpecialistWithDescription", "Otra descripcion")).toBe(specialist);
        expect(DraxAgentFactory.instance("taskSpecialistWithDescription").description).toBe("Resuelve tareas especificas");
    });

    test("creates a session and sends messages through the injected provider", async () => {
        const provider = new MockProvider();
        const agent = new DraxAgent().configure({
            provider,
            systemPrompt: "Sos un asistente.",
            sessionService: false,
        });

        const session = await agent.startSession({userId: "user-1", tenantId: "tenant-1"});
        const response = await agent.sendMessage({
            sessionId: session.id,
            userId: "user-1",
            tenantId: "tenant-1",
            message: "Hola",
        });

        expect(response).toMatchObject({
            sessionId: session.id,
            message: "respuesta",
            tokens: 10,
        });
        expect(provider.requests[0]).toMatchObject({
            userInput: "Hola",
            tenant: "tenant-1",
            user: "user-1",
        });
        expect(provider.requests[0].systemPrompt).toContain("Sos un asistente.");
        expect(provider.requests[0].systemPrompt).toContain("[CONTEXTO RBAC]");
        expect(provider.requests[0].systemPrompt).toContain("tenantId: tenant-1");
        expect(provider.requests[0].systemPrompt).toContain("userId: user-1");
        expect(provider.requests[0].systemPrompt).toContain("tenant, tenantId, user, userId o createdBy");
    });

    test("injects builder tools, custom tools and builder prompt sections", async () => {
        const calls: any[] = [];
        const provider = new MockProvider();
        const customTool: IPromptTool = {
            name: "custom_search",
            description: "Buscar datos custom",
            parameters: {
                type: "object",
                properties: {
                    value: {type: "string"},
                },
            },
            execute: async args => {
                calls.push(args);
                return [{name: args.value}];
            },
        };

        const agent = new DraxAgent().configure({
            provider,
            systemPrompt: "Prompt base.",
            sessionService: false,
            toolBuilders: [{
                getTools: () => [],
                getSystemPromptSection: () => "[ENTIDAD: person]\nTools disponibles:",
            }],
            tools: [customTool],
        });

        await agent.sendMessage({
            userId: "user-1",
            message: "Busca Ada",
        });

        expect(provider.requests[0].systemPrompt).toContain("Prompt base.");
        expect(provider.requests[0].systemPrompt).toContain("[ENTIDADES Y TOOLS]");
        expect(provider.requests[0].systemPrompt).toContain("[ENTIDAD: person]");
        expect(provider.requests[0].tools?.map(tool => tool.name)).toEqual(["custom_search"]);
        expect(calls).toEqual([{value: "Ada"}]);
    });

    test("uses previous session messages as history", async () => {
        const provider = new MockProvider();
        const agent = new DraxAgent().configure({
            provider,
            systemPrompt: "Sos un asistente.",
            sessionService: false,
            toolBuilders: undefined,
            tools: undefined,
        });

        const first = await agent.sendMessage({
            userId: "user-1",
            message: "Primer mensaje",
        });
        await agent.sendMessage({
            sessionId: first.sessionId,
            userId: "user-1",
            message: "Segundo mensaje",
        });

        expect(provider.requests[1].history).toEqual([
            {role: "user", content: "Primer mensaje"},
            {role: "assistant", content: "respuesta"},
        ]);
    });

    test("returns a navigation path from tool execution metadata", async () => {
        const provider = new MockProvider();
        const agent = new DraxAgent().configure({
            provider,
            systemPrompt: "Sos un asistente.",
            sessionService: false,
            toolBuilders: undefined,
            tools: [{
                name: "task_findOne",
                description: "Buscar una tarea",
                parameters: {
                    type: "object",
                    properties: {
                        value: {type: "string"},
                    },
                },
                navigation: {
                    entityName: "task",
                    method: "findOne",
                },
                execute: async () => ({id: "task-1", title: "Ada"}),
            }],
        });

        const response = await agent.sendMessage({
            userId: "user-1",
            message: "Busca Ada",
        });

        expect(response.navigationPath).toBe("/crud/task?mode=view&id=task-1");
    });

    test("persists agent session creation and message updates", async () => {
        const provider = new MockProvider();
        const created: any[] = [];
        const updates: any[] = [];
        const sessionService = {
            create: async (data: any) => {
                created.push(data);
                return {_id: "agent-session-1", ...data};
            },
            updatePartial: async (id: string, data: any) => {
                updates.push({id, data});
                return {_id: id, ...data};
            },
            findBy: async () => [],
            findById: async () => ({
                _id: "agent-session-1",
                sessionId: "session-1",
                inputTokens: 1,
                outputTokens: 2,
                tokens: 3,
            }),
        } as any;

        const agent = new DraxAgent().configure({
            provider,
            systemPrompt: "Sos un asistente.",
            sessionService,
            toolBuilders: undefined,
            tools: undefined,
        });

        const response = await agent.sendMessage({
            sessionId: "session-1",
            userId: "user-1",
            tenantId: "tenant-1",
            message: "Hola",
        });

        expect(response.sessionId).toBe("session-1");
        expect(created[0]).toMatchObject({
            sessionId: "session-1",
            tenant: "tenant-1",
            user: "user-1",
            messageCount: 0,
        });
        expect(updates[0]).toMatchObject({
            id: "agent-session-1",
            data: {
                sessionId: "session-1",
                tenant: "tenant-1",
                user: "user-1",
                title: "Hola",
                messageCount: 2,
                inputTokens: 7,
                outputTokens: 6,
                tokens: 13,
            },
        });
        expect(updates[0].data.messages).toEqual([
            expect.objectContaining({role: "user", content: "Hola"}),
            expect.objectContaining({role: "assistant", content: "respuesta"}),
        ]);
    });
});
