import {describe, expect, test} from "vitest";
import {DraxAgent} from "../src/agents/DraxAgent.js";
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
    test("creates a session and sends messages through the injected provider", async () => {
        const provider = new MockProvider();
        const agent = DraxAgent.instance().clearSessions().configure({
            provider,
            systemPrompt: "Sos un asistente.",
        });

        const session = agent.startSession({userId: "user-1", tenantId: "tenant-1"});
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

        const agent = DraxAgent.instance().clearSessions().configure({
            provider,
            systemPrompt: "Prompt base.",
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
        const agent = DraxAgent.instance().clearSessions().configure({
            provider,
            systemPrompt: "Sos un asistente.",
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
        const agent = DraxAgent.instance().clearSessions().configure({
            provider,
            systemPrompt: "Sos un asistente.",
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
});
