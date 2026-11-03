import {beforeAll, describe, expect, test, vi} from "vitest"
import {DraxAgentFactory} from "@drax/ai-back"
import type {IAIProvider, IPromptParams} from "@drax/ai-back"
import {initializeAgent} from "../../src/setup/InitializeAgent.js"

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
        .sendMessage({message: "Presentate", userId: "user-1", tenantId: "tenant-1"})
    return request!
}

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
