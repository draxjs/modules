import {describe, test, expect} from 'vitest'
import {KnowledgeService, OpenAiProvider, OpenAiProviderFactory} from "../src";


describe('KnowledgeService Test', () => {

    test('KnowledgeService URL', async () => {
        const ks = new KnowledgeService()
        const content = await ks.getFromUrl('https://exigroup.com.ar/preguntas-frecuentes/')
        console.log(content)

        const openAi = OpenAiProviderFactory.instance()
        expect(openAi).toBeInstanceOf(OpenAiProvider)

        const systemPrompt = `
        Por favor, optimiza el siguiente contenido extraído de una página web o documento PDF:
        1. Elimina cualquier código JavaScript, CSS o HTML residual.
        2. Organiza el contenido de manera lógica y coherente.
        3. Elimina información redundante o irrelevante.
        4. Asegúrate de que el contenido sea claro y fácil de entender.
        5. No uses marcadores de posición, formato markdown o etiquetas HTML, solo texto simple.
        `
        const userInput = content
        const r = await openAi.prompt({systemPrompt, userInput})

        const contentOptimal = r.output

        console.log(contentOptimal)
        const chunks = ks.chunkTextBySentence(contentOptimal)
        console.log(chunks)

        expect(chunks).toBeInstanceOf(Array)

    }, 30000) // 10 seconds timeout

})
