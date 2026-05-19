import {DraxAgentFactory, BuilderTool, AiProviderFactory} from "@drax/ai-back"
import type {DraxAgentConfig, DraxAgentToolBuilderSource} from "@drax/ai-back"
import {CountryServiceFactory} from "../modules/people/factory/services/CountryServiceFactory.js"
import {CountryBaseSchema} from "../modules/people/schemas/CountrySchema.js"


async function initializeAgent(): Promise<void> {

    const countryTool = new BuilderTool({
        entityDescription: "Paises del sistema",
        entityName: "Country",
        methods: ["search","findFirst","findLast","create","updatePartial"],
        schema: CountryBaseSchema,
        service: CountryServiceFactory.instance

    })

    const toolBuilders: DraxAgentToolBuilderSource = [
        countryTool
    ]
    const configDefault: DraxAgentConfig = {
        provider: AiProviderFactory.instance("DeepSeek")
    }

    const configCountry: DraxAgentConfig = {
        toolBuilders: toolBuilders,
        provider: AiProviderFactory.instance("DeepSeek")
    }

    DraxAgentFactory.instance("default", "Agente default")
        .configure(configDefault)
    DraxAgentFactory.instance("country", "Agente para operar entidad country")
        .configure(configCountry)
}

export { initializeAgent}
export default initializeAgent
