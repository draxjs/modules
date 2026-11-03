import {beforeAll, beforeEach, describe, expect, test, vi} from "vitest"
import {DraxAgentFactory} from "@drax/ai-back"
import type {IAIProvider, IPromptParams} from "@drax/ai-back"
import {initializeAgent} from "../../src/setup/InitializeAgent.js"

// The public package can still point at an older dist during the coordinated router build.
// Keep its other exports, but exercise the real source registry/router rather than a fake factory.
vi.mock("@drax/ai-back", async importOriginal => ({
    ...await importOriginal<typeof import("@drax/ai-back")>(),
    ...await import("../../../../ai/ai-back/src/factory/DraxAgentFactory.js")
}))

const boundaries = vi.hoisted(() => ({
    provider: vi.fn(() => { throw new Error("Bootstrap must not resolve an AI provider") }),
    persistence: vi.fn(() => { throw new Error("Tests must not resolve a session repository") })
}))
vi.mock("../../../../ai/ai-back/src/factory/ai/AiProviderFactory.js", () => ({
    default: {instance: boundaries.provider}
}))
vi.mock("../../../../ai/ai-back/src/factory/services/AgentSessionServiceFactory.js", () => ({
    default: {get instance() { return boundaries.persistence() }}
}))

const services = vi.hoisted(() => {
    const buildService = () => ({
        search: vi.fn(async () => []),
        findById: vi.fn(async (id: string) => ({_id: id})),
        findFirst: vi.fn(async () => []),
        findLast: vi.fn(async () => []),
        paginate: vi.fn(async () => ({docs: [], totalDocs: 0})),
        create: vi.fn(async (data: any) => ({_id: "new-record", ...data})),
        updatePartial: vi.fn(async (id: string, data: any) => ({_id: id, ...data})),
    })
    return {Country: buildService(), Language: buildService(), Person: buildService()}
})

vi.mock("../../src/modules/people/factory/services/CountryServiceFactory.js", () => ({
    CountryServiceFactory: {instance: services.Country}
}))
vi.mock("../../src/modules/people/factory/services/LanguageServiceFactory.js", () => ({
    LanguageServiceFactory: {instance: services.Language}
}))
vi.mock("../../src/modules/people/factory/services/PersonServiceFactory.js", () => ({
    PersonServiceFactory: {instance: services.Person}
}))

async function captureRequest(identifier: string): Promise<IPromptParams> {
    let request: IPromptParams
    const provider: IAIProvider = {
        async prompt(input) {
            request = input
            return {output: "ok", tokens: 0, inputTokens: 0, outputTokens: 0, time: 0}
        }
    }
    await DraxAgentFactory.instance(identifier)
        .configure({provider, sessionService: false, logToolExecution: false})
        .sendMessage({message: "Presentate", userId: "user-1", tenantId: "tenant-1", accessContext})
    return request!
}

const accessContext = {userId: "user-1", tenantId: "tenant-1", authenticated: true, permissions: []}

const specialists = [
    {identifier: "country", name: "Atlas", entity: "Country"},
    {identifier: "language", name: "Léxico", entity: "Language"},
    {identifier: "person", name: "Nexo", entity: "Person"},
] as const

const methods = ["search", "findById", "findFirst", "findLast", "paginate", "create", "updatePartial"]

describe("Zuite specialist agents", () => {
    beforeAll(async () => {
        // Service factories are stubbed: bootstrap must not require a DB or an AI provider.
        await initializeAgent()
    })

    test("registers stable identifiers and descriptive specialist names", () => {
        expect(DraxAgentFactory.agents().map(agent => agent.identifier).sort())
            .toEqual(["country", "default", "language", "person"])
        for (const {identifier, name} of specialists) {
            expect(DraxAgentFactory.instance(identifier).description).toContain(name)
        }
    })

    test("default bootstrap adds no routing metadata or access restrictions", async () => {
        for (const agent of DraxAgentFactory.agents()) {
            expect(agent.routing).toBeUndefined()
            expect(await agent.canAccess()).toBe(true)
        }
        expect(boundaries.provider).not.toHaveBeenCalled()
        expect(boundaries.persistence).not.toHaveBeenCalled()
    })

    test("general assistant alone does not opt into routing or replace the guide", async () => {
        await initializeAgent({includeGeneralAssistant: true})
        expect(DraxAgentFactory.lookup("auto")).toBeUndefined()
        expect(DraxAgentFactory.instance("default").routing).toBeUndefined()
        expect((await captureRequest("default")).systemPrompt).toContain("Sos Guía Zuite")
    })

    test("keeps the default agent as a guide without entity tools or schemas", async () => {
        const request = await captureRequest("default")
        expect(request.tools).toEqual([])
        expect(request.systemPrompt).not.toContain("[ENTIDAD:")
        for (const {identifier, name} of specialists) {
            expect(request.systemPrompt).toContain(identifier)
            expect(request.systemPrompt).toContain(name)
        }
    })

    test.each(specialists)("$identifier receives only its entity tools and schema", async ({identifier, name, entity}) => {
        const request = await captureRequest(identifier)
        expect(request.systemPrompt).toContain(`Sos ${name}`)
        expect(request.systemPrompt).toContain(`[ENTIDAD: ${entity}]`)
        expect(request.systemPrompt).toContain("userId: user-1")
        expect(request.systemPrompt).toContain("tenantId: tenant-1")
        expect(request.tools?.map(tool => tool.name)).toEqual(methods.map(method => `${entity}_${method}`))

        for (const other of specialists.filter(specialist => specialist.entity !== entity)) {
            expect(request.systemPrompt).not.toContain(`[ENTIDAD: ${other.entity}]`)
        }
    })

    test.each(specialists)("$identifier tools delegate to its own service", async ({identifier, entity}) => {
        const request = await captureRequest(identifier)
        const service = services[entity]
        const data = entity === "Person"
                    ? {fullname: "Persona de prueba", address: {street: "Calle de prueba 123"}}
                    : {name: "Registro de prueba"}
        vi.clearAllMocks()

        await request.tools?.find(tool => tool.name === `${entity}_search`)?.execute({value: "ejemplo", limit: 5})
        expect(service.search).toHaveBeenCalledWith("ejemplo", 5, [])

        await request.tools?.find(tool => tool.name === `${entity}_create`)?.execute({data})
        expect(service.create).toHaveBeenCalledWith(data)

        await request.tools?.find(tool => tool.name === `${entity}_updatePartial`)?.execute({id: "record-1", data})
        expect(service.updatePartial).toHaveBeenCalledWith("record-1", data)

        for (const other of specialists.filter(specialist => specialist.entity !== entity)) {
            for (const method of Object.values(services[other.entity])) {
                expect(method).not.toHaveBeenCalled()
            }
        }
    })

    test("prompts describe entity-specific constraints without adding cross-domain tools", async () => {
        const country = await captureRequest("country")
        expect(country.systemPrompt).toContain("createdBy con userId")
        expect(country.systemPrompt).toContain("Sin userId, no crees")

        const language = await captureRequest("language")
        expect(language.systemPrompt).toContain("No tenés una tool de subida de archivos")
        expect(language.systemPrompt).toContain("archivedAt")

        const person = await captureRequest("person")
        expect(person.systemPrompt).toContain("fullname y address con street")
        expect(person.systemPrompt).toContain("no implica un merge profundo")
        expect(person.systemPrompt).toContain("No muestres secret")
        const createParameters = person.tools?.find(tool => tool.name === "Person_create")?.parameters as any
        expect(createParameters.properties.data.required).toEqual(expect.arrayContaining(["fullname", "address"]))
        expect(createParameters.properties.data.properties.address.required).toContain("street")
    })

    test("initializing again preserves instances and does not duplicate tools", async () => {
        const instances = specialists.map(({identifier}) => DraxAgentFactory.instance(identifier))
        await initializeAgent()
        for (const [index, {identifier, entity}] of specialists.entries()) {
            expect(DraxAgentFactory.instance(identifier)).toBe(instances[index])
            const request = await captureRequest(identifier)
            expect(request.tools?.map(tool => tool.name)).toEqual(methods.map(method => `${entity}_${method}`))
        }
    })
})

describe("Zuite opt-in conversational router", () => {
    const routingProvider = {
        prompt: vi.fn(async (_input: IPromptParams) => ({
            output: {action: "clarify", agentIdentifier: null, message: "¿Qué catálogo querés consultar?", requiresMultipleSpecialists: false},
            tokens: 3, inputTokens: 2, outputTokens: 1, time: 0
        }))
    }

    beforeEach(async () => {
        vi.clearAllMocks()
        await initializeAgent({router: true, routingProvider, routingModel: "classification-test-model"})
    })

    test("registers auto as a recommended authenticated router without resolving providers", async () => {
        expect(DraxAgentFactory.agents().map(agent => agent.identifier).sort())
            .toEqual(["auto", "country", "default", "language", "person"])
        const router = DraxAgentFactory.router("auto")
        expect(router.type).toBe("router")
        expect(router.routing).toEqual({recommended: true})
        expect(await router.canAccess()).toBe(false)
        expect(await router.canAccess(accessContext)).toBe(true)
        expect(routingProvider.prompt).not.toHaveBeenCalled()
        expect(boundaries.provider).not.toHaveBeenCalled()
        expect(boundaries.persistence).not.toHaveBeenCalled()
        for (const service of Object.values(services)) {
            for (const method of Object.values(service)) expect(method).not.toHaveBeenCalled()
        }
    })

    test("catalog exposes only precise authorized specialist metadata, never prompts or tools", async () => {
        const router = DraxAgentFactory.router("auto")
        expect(await router.buildCatalog()).toEqual([])
        const catalog = await router.buildCatalog(accessContext)
        expect(catalog.map(agent => agent.identifier).sort()).toEqual(["country", "language", "person"])
        for (const {identifier, entity} of specialists) {
            const agent = DraxAgentFactory.instance(identifier)
            expect(agent.routing?.eligible).toBe(true)
            expect(agent.routing?.capabilities).toContain(entity)
            expect(agent.routing?.examples?.length).toBeGreaterThan(0)
            expect(await agent.canAccess()).toBe(false)
            expect(await agent.canAccess(accessContext)).toBe(true)
            expect(Object.keys(catalog.find(entry => entry.identifier === identifier)!).sort())
                .toEqual(["capabilities", "description", "examples", "identifier"])
        }
        const guide = await captureRequest("default")
        expect(guide.systemPrompt).toContain("Sos Guía Zuite")
        expect(guide.tools).toEqual([])
        expect(DraxAgentFactory.instance("default").routing).toEqual({eligible: false})
    })

    test("forwards the routing provider/model only at turn time with no tools", async () => {
        const router = DraxAgentFactory.router("auto").configure({sessionService: false})
        const result = await router.sendMessage({message: "Ayudame", userId: "user-1", tenantId: "tenant-1", accessContext})
        expect(routingProvider.prompt).toHaveBeenCalledTimes(1)
        const request = routingProvider.prompt.mock.calls[0][0]
        expect(request.model).toBe("classification-test-model")
        expect(request.tools).toEqual([])
        expect(result.message).toBe("¿Qué catálogo querés consultar?")
        expect(boundaries.provider).not.toHaveBeenCalled()
        expect(boundaries.persistence).not.toHaveBeenCalled()
    })

    test("includes the tool-free general assistant only with the explicit second opt-in", async () => {
        await initializeAgent({router: true, includeGeneralAssistant: true, routingProvider})
        const router = DraxAgentFactory.router("auto")
        expect((await router.buildCatalog(accessContext)).map(agent => agent.identifier).sort())
            .toEqual(["country", "default", "language", "person"])
        const general = DraxAgentFactory.instance("default")
        expect(general.routing?.eligible).toBe(true)
        expect(await general.canAccess()).toBe(false)
        const request = await captureRequest("default")
        expect(request.tools).toEqual([])
        expect(request.systemPrompt).toContain("Sos el Asistente general Zuite")
        expect(request.systemPrompt).toContain("No tenés tools ni acceso a registros")
        expect(request.systemPrompt).not.toContain("[ENTIDAD:")
        for (const {identifier, name, entity} of specialists) {
            const specialistRequest = await captureRequest(identifier)
            expect(specialistRequest.systemPrompt).toContain(`Sos ${name}`)
            expect(specialistRequest.tools?.map(tool => tool.name)).toEqual(methods.map(method => `${entity}_${method}`))
        }
        expect(routingProvider.prompt).not.toHaveBeenCalled()
        await initializeAgent({router: true})
        expect((await router.buildCatalog(accessContext)).map(agent => agent.identifier)).not.toContain("default")
        expect((await captureRequest("default")).systemPrompt).toContain("Sos Guía Zuite")
    })

    test("reinitializing the router preserves singleton identity and explicit candidate allowlists", async () => {
        const router = DraxAgentFactory.router("auto")
        const registerRouter = vi.spyOn(DraxAgentFactory, "router")
        try {
            await initializeAgent({router: true, routingProvider})
            expect(registerRouter).toHaveBeenLastCalledWith("auto", expect.any(String), expect.objectContaining({
                tools: [], toolBuilders: [], access: {requireUser: true}, routing: {recommended: true},
                candidateIdentifiers: ["country", "language", "person"], routingProvider
            }))
            expect(DraxAgentFactory.lookup("auto")).toBe(router)
            expect((await router.buildCatalog(accessContext)).map(agent => agent.identifier).sort())
                .toEqual(["country", "language", "person"])
            expect(DraxAgentFactory.agents().filter(agent => agent.identifier === "auto")).toHaveLength(1)

            await initializeAgent({router: true, includeGeneralAssistant: true})
            expect(registerRouter).toHaveBeenLastCalledWith("auto", expect.any(String), expect.objectContaining({
                candidateIdentifiers: ["country", "language", "person", "default"]
            }))
        } finally {
            registerRouter.mockRestore()
        }
    })
})
