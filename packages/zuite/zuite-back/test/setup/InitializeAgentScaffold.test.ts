import {afterEach, beforeAll, describe, expect, test, vi} from "vitest"
import {DraxAgentFactory} from "@drax/ai-back"
import type {IPromptParams} from "@drax/ai-back"
import initializeAgentScaffold, {initializeAgentScaffold as namedInitializer} from "../../src/setup/InitializeAgentScaffold.js"

vi.mock("@drax/ai-back", () => import("../../../../ai/ai-back/src/factory/DraxAgentFactory.js"))

const boundaries = vi.hoisted(() => ({
    provider: vi.fn(() => { throw new Error("Scaffold bootstrap must not initialize an AI provider") }),
    persistence: vi.fn(() => { throw new Error("Scaffold tests must not access a database") })
}))
vi.mock("../../../../ai/ai-back/src/factory/ai/AiProviderFactory.js", () => ({
    default: {instance: boundaries.provider}
}))
vi.mock("../../../../ai/ai-back/src/factory/services/AgentSessionServiceFactory.js", () => ({
    default: {get instance() { return boundaries.persistence() }}
}))

const accessContext = {userId: "scaffold-user", tenantId: null, authenticated: true, permissions: []}
const input = {message: "Consulta de prueba", userId: accessContext.userId, tenantId: null, accessContext}
const candidates = ["default", "support", "writing"]
const usage = {tokens: 3, inputTokens: 2, outputTokens: 1, time: 0}

async function captureRequest(identifier: string): Promise<IPromptParams> {
    let request: IPromptParams
    await DraxAgentFactory.lookup(identifier)!.configure({
        sessionService: false,
        provider: {async prompt(value) {
            request = value
            return {...usage, output: `Respuesta de ${identifier}`}
        }}
    }).sendMessage(input)
    return request!
}

describe("Scaffold agent initializer", () => {
    beforeAll(async () => {
        await initializeAgentScaffold()
    })

    afterEach(() => {
        expect(boundaries.provider).not.toHaveBeenCalled()
        expect(boundaries.persistence).not.toHaveBeenCalled()
    })

    test("exports one initializer and registers only a general assistant, two examples and the router", () => {
        expect(namedInitializer).toBe(initializeAgentScaffold)
        expect(DraxAgentFactory.agents().map(agent => agent.identifier).sort())
            .toEqual(["auto", "default", "support", "writing"])
        expect(DraxAgentFactory.lookup("auto")!.type).toBe("router")
        expect(DraxAgentFactory.lookup("auto")!.routing?.recommended).toBe(true)
    })

    test("builds an explicitly authenticated catalog without any entity services", async () => {
        const router = DraxAgentFactory.router("auto")
        expect((await router.buildCatalog(accessContext)).map(agent => agent.identifier)).toEqual(candidates)
        expect(await router.buildCatalog()).toEqual([])
        for (const agent of DraxAgentFactory.agents()) {
            expect(await agent.canAccess()).toBe(false)
            expect(await agent.canAccess(accessContext)).toBe(true)
        }
    })

    test.each(candidates)("%s has its own prompt and no entity tools or schemas", async identifier => {
        const request = await captureRequest(identifier)
        expect(request.tools).toEqual([])
        expect(request.systemPrompt).not.toContain("[ENTIDAD:")
        expect(request.systemPrompt).toContain({
            default: "Sos un asistente general",
            support: "Sos un asistente de orientación técnica",
            writing: "Sos un asistente de redacción y revisión de texto"
        }[identifier])
        expect(DraxAgentFactory.lookup(identifier)!.routing).toMatchObject({eligible: true})
    })

    test("auto delegates to the example roles while keeping one continuous conversation", async () => {
        const router = DraxAgentFactory.router("auto")
        const destinations = ["support", "writing"]
        const routing = vi.fn(async (request: IPromptParams) => {
            expect(request.tools).toEqual([])
            expect(request.audioResponse).toBe(false)
            expect(JSON.parse(request.userInput!).catalog.map((agent: {identifier: string}) => agent.identifier)).toEqual(candidates)
            return {...usage, output: {
                action: "delegate", agentIdentifier: destinations.shift(), message: null, requiresMultipleSpecialists: false
            }}
        })
        router.configure({routingProvider: {prompt: routing}, sessionService: false})
        const first = await router.sendMessage(input)
        const second = await router.sendMessage({...input, sessionId: first.sessionId, message: "Ahora revisá este texto"})
        expect(first).toMatchObject({agentIdentifier: "auto", resolvedAgentIdentifier: "support", message: "Respuesta de support"})
        expect(second).toMatchObject({agentIdentifier: "auto", sessionId: first.sessionId, resolvedAgentIdentifier: "writing", message: "Respuesta de writing"})
        expect(routing).toHaveBeenCalledTimes(2)
        expect(routing.mock.calls[1][0].history).toHaveLength(2)
    })

    test("reinitializing at bootstrap does not duplicate agents or change their identities", async () => {
        const instances = DraxAgentFactory.agents()
        await initializeAgentScaffold()
        expect(DraxAgentFactory.agents()).toEqual(instances)
        expect((await DraxAgentFactory.router("auto").buildCatalog(accessContext)).map(agent => agent.identifier)).toEqual(candidates)
    })
})
