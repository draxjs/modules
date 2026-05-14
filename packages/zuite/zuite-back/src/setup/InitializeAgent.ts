import {DraxAgent, BuilderTool, AiProviderFactory} from "@drax/ai-back"
import type {DraxAgentConfig, DraxAgentToolBuilderSource} from "@drax/ai-back"
import {CountryServiceFactory} from "../modules/people/factory/services/CountryServiceFactory.js"
import {CountryBaseSchema} from "../modules/people/schemas/CountrySchema.js"


async function initializeAgent(): Promise<void> {

    const countryTool = new BuilderTool({
        entityDescription: "Paises del sistema",
        entityName: "Country",
        methods: ["search","find","create","updatePartial"],
        schema: CountryBaseSchema,
        service: CountryServiceFactory.instance

    })

    const toolBuilders: DraxAgentToolBuilderSource = [
        countryTool
    ]
    const config: DraxAgentConfig = {
        toolBuilders: toolBuilders,
        provider: AiProviderFactory.instance("GoogleAi")
    }

    DraxAgent.instance().configure(config)
}

export { initializeAgent}
export default initializeAgent
