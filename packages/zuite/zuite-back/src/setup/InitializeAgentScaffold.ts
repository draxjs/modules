import {DraxAgentFactory} from "@drax/ai-back"
import type {DraxAgentConfig} from "@drax/ai-back"

const config: DraxAgentConfig = {
    tools: [],
    toolBuilders: [],
    access: {requireUser: true}
}

// Inicializador alternativo: usar en lugar de InitializeAgent, no junto a él.
async function initializeAgentScaffold(): Promise<void> {
    DraxAgentFactory.instance("default", "Asistente general").configure({
        ...config,
        systemPrompt: "Sos un asistente general. Respondé en español con ayuda conceptual clara. No tenés tools ni acceso a datos del sistema; no inventes registros ni afirmes haber ejecutado operaciones. Para orientación técnica indicá support y para redacción o revisión de texto, writing; no delegás por tu cuenta.",
        routing: {
            eligible: true,
            capabilities: "Conocimiento general y ayuda conceptual, sin acceso a datos del sistema. No cubre soporte técnico ni redacción/revisión de textos."
        }
    })

    DraxAgentFactory.instance("support", "Orientación técnica").configure({
        ...config,
        systemPrompt: "Sos un asistente de orientación técnica. Explicá conceptos y sugerí pasos de diagnóstico a partir de lo que cuente el usuario. No tenés tools ni acceso a sistemas, logs ni datos reales: no afirmes haberlos inspeccionado, corregido o ejecutado comandos. Pedí contexto y no solicites secretos.",
        routing: {
            eligible: true,
            capabilities: "Orientación técnica conceptual y sugerencias de diagnóstico basadas en la descripción del usuario, sin tools, inspección ni operaciones sobre sistemas reales."
        }
    })

    DraxAgentFactory.instance("writing", "Redacción y revisión de texto").configure({
        ...config,
        systemPrompt: "Sos un asistente de redacción y revisión de texto. Trabajá sobre el texto y las instrucciones aportadas por el usuario, conservá su intención y pedí aclaraciones cuando falten. No tenés tools ni acceso autónomo a archivos o datos del sistema; no inventes hechos ni afirmes haber guardado o publicado nada.",
        routing: {
            eligible: true,
            capabilities: "Redacción, corrección y revisión de textos aportados por el usuario, sin tools, consultas de datos ni publicación o guardado de archivos."
        }
    })

    // Usa el provider configurado por AI_PROVIDER; no realiza inferencias al inicializar.
    DraxAgentFactory.router("auto", "Automático — Un único asistente por consulta", {
        ...config,
        routing: {recommended: true},
        candidateIdentifiers: ["default", "support", "writing"]
    })
}

export {initializeAgentScaffold}
export default initializeAgentScaffold
