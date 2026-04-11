import {describe, test, expect} from 'vitest'
import {OpenAiProvider, OpenAiProviderFactory} from "../src";
import z from "zod";
import {IPromptMemory, IPromptMessage} from "../src/interfaces/IAIProvider";


describe('OpenAi Test', () => {

    test('OpenAi prompt supports image inputs and vision model fallback', async () => {
        let request: any

        class MockedOpenAiProvider extends OpenAiProvider {
            constructor() {
                super('test-key', 'gpt-4.1-mini', 'gpt-4o-mini')
                this._client = {
                    chat: {
                        completions: {
                            create: async (payload: any) => {
                                request = payload
                                return {
                                    choices: [{message: {content: '{"name":"invoice"}'}}],
                                    usage: {
                                        total_tokens: 10,
                                        prompt_tokens: 7,
                                        completion_tokens: 3
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        const openAi = new MockedOpenAiProvider()

        const r = await openAi.prompt({
            systemPrompt: 'Extract invoice data',
            userInput: 'Read this invoice',
            userImages: [{url: 'data:image/png;base64,abc123', detail: 'high'}]
        })

        expect(r.output).toBe('{"name":"invoice"}')
        expect(request.model).toBe('gpt-4o-mini')
        expect(request.messages[1]).toEqual({
            role: 'user',
            content: [
                {type: 'text', text: 'Read this invoice'},
                {
                    type: 'image_url',
                    image_url: {
                        url: 'data:image/png;base64,abc123',
                        detail: 'high'
                    }
                }
            ]
        })
    })

    test('OpenAi prompt keeps default model for text-only inputs', async () => {
        let request: any

        class MockedOpenAiProvider extends OpenAiProvider {
            constructor() {
                super('test-key', 'gpt-4.1-mini', 'gpt-4o-mini')
                this._client = {
                    chat: {
                        completions: {
                            create: async (payload: any) => {
                                request = payload
                                return {
                                    choices: [{message: {content: 'Buenos Aires'}}],
                                    usage: {
                                        total_tokens: 8,
                                        prompt_tokens: 6,
                                        completion_tokens: 2
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        const openAi = new MockedOpenAiProvider()

        await openAi.prompt({
            systemPrompt: 'You are an AI assistant.',
            userInput: 'What is the capital of Argentina?'
        })

        expect(request.model).toBe('gpt-4.1-mini')
        expect(request.messages[1]).toEqual({
            role: 'user',
            content: 'What is the capital of Argentina?'
        })
    })

    test('OpenAi Factory', () => {
        const openAi = OpenAiProviderFactory.instance()
        expect(openAi).toBeInstanceOf(OpenAiProvider)
    })

    test('OpenAi prompt', async () => {
        const openAi = OpenAiProviderFactory.instance()
        expect(openAi).toBeInstanceOf(OpenAiProvider)

        const systemPrompt = "You are an AI assistant."
        const userInput = "What is the capital of Argentina?"
        const r = await openAi.prompt({systemPrompt, userInput})
        console.log(r)
        expect(r.output).toBeDefined()
        expect(/Buenos Aires/i.test(r.output)).toBeTruthy()
    })

    test('OpenAi prompt jsonSchema', async () => {
        const openAi = OpenAiProviderFactory.instance()
        expect(openAi).toBeInstanceOf(OpenAiProvider)

        const systemPrompt = "You are an AI assistant."
        const userInput = "What is the most famous pokemon"
        const jsonSchema = {
            type: "json_schema",
            json_schema: {
                name: "element_description",
                schema: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            description: "El nombre del elemento"
                        },
                        type: {
                            type: "string",
                            description: "El tipo de elemento, como archivo, carpeta, enlace, etc."
                        },
                        description: {
                            type: "string",
                            description: "Una breve descripción del elemento"
                        }
                    },
                    required: ["name", "type", "description"]
                }
            }
        }


        const r = await openAi.prompt({systemPrompt, userInput, jsonSchema})
        console.log(r)
        expect(r.output).toBeDefined
        const pokemon = JSON.parse(r.output)
        expect(pokemon.name).toBe("Pikachu")
    })

    test('OpenAi prompt zodSchema', async () => {
        const openAi = OpenAiProviderFactory.instance()
        expect(openAi).toBeInstanceOf(OpenAiProvider)

        const systemPrompt = "You are an AI assistant."
        const userInput = "What is the most famous pokemon"
        const zodSchema = z.object({
            name: z.string(),
            type: z.string(),
            description: z.string()
        })

        const r = await openAi.prompt({systemPrompt, userInput, zodSchema})
        console.log(r)
        expect(r.output).toBeDefined
        const pokemon = zodSchema.parse(JSON.parse(r.output))
        expect(pokemon.name).toBe("Pikachu")
    })

    test('OpenAi prompt zodSchema and Knowledge base', async () => {
        const openAi = OpenAiProviderFactory.instance()
        expect(openAi).toBeInstanceOf(OpenAiProvider)

        const systemPrompt = "You are an AI assistant."
        const knowledgeBase = ["Charmander is a legendary and most famous Pokémon from the Pokémon series. It has a type of fire."]
        const zodSchema = z.object({
            name: z.string(),
            type: z.string(),
            description: z.string()
        })

        const userInput = "What is the most famous pokemon"
        const r = await openAi.prompt({systemPrompt, userInput, zodSchema, knowledgeBase})
        console.log(r)
        expect(r.output).toBeDefined
        const pokemon = zodSchema.parse(JSON.parse(r.output))
        expect(pokemon.name).toBe("Charmander")
    })

    test('OpenAi prompt zodSchema, Knowledge base and history', async () => {
        const openAi = OpenAiProviderFactory.instance()
        expect(openAi).toBeInstanceOf(OpenAiProvider)

        const systemPrompt = "You are an AI assistant."

        const knowledgeBase = ["Charmander is a legendary and most famous Pokémon from the Pokémon series. It has a type of fire."]
        const history: IPromptMessage[] = [
            {role: 'assistant', content: 'what is your favourite pokemon'},
            {role: 'user', content: 'My favourite pokemon is Bulbasaur and is a water type'},
            {role: 'assistant', content: 'Do you like team Rocket?'},
            {role: 'user', content: 'No, never!'},
        ]

        const zodSchema = z.object({
            famous: z.object({
                name: z.string(),
                type: z.string(),
                description: z.string()
            }),
            favorite: z.object({
                name: z.string(),
                type: z.string(),
                description: z.string()
            })

        })

        const userInput = "What is the most famous pokemon and what is my favorite?"

        const r = await openAi.prompt({systemPrompt, userInput, zodSchema, knowledgeBase, history})
        console.log(r)
        expect(r.output).toBeDefined
        const pokemons = zodSchema.parse(JSON.parse(r.output))
        expect(pokemons.famous.name).toBe("Charmander")
        expect(pokemons.famous.type).toBeOneOf(["fire", "Fire"])
        expect(pokemons.favorite.name).toBe("Bulbasaur")
        expect(pokemons.favorite.type).toBeOneOf(["water", "Water"]) //Lie in this test, but it's a part of the schema and history for demonstration purposes.'
    })

    test('OpenAi prompt zodSchema, Knowledge base and memory', async () => {
        const openAi = OpenAiProviderFactory.instance()
        expect(openAi).toBeInstanceOf(OpenAiProvider)

        const systemPrompt = "You are an AI assistant."

        const knowledgeBase = ["Charmander is a legendary and most famous Pokémon from the Pokémon series. It has a type of fire."]


        const memory: IPromptMemory[] = [
            {key: 'favorite_pokemon', value: 'Squirtle'},
            {key: 'favourite_pokemon_type', value: 'water'},
        ]

        const zodSchema = z.object({
            famous: z.object({
                name: z.string(),
                type: z.string(),
                description: z.string()
            }),
            favorite: z.object({
                name: z.string(),
                type: z.string(),
                description: z.string()
            })

        })

        const userInput = "What is the most famous pokemon and what is my favorite?"

        const r = await openAi.prompt({systemPrompt, userInput, zodSchema, knowledgeBase, memory})
        console.log(r)
        expect(r.output).toBeDefined
        const pokemons = zodSchema.parse(JSON.parse(r.output))
        expect(pokemons.famous.name).toBe("Charmander")
        expect(pokemons.famous.type).toBe("fire")
        expect(pokemons.favorite.name).toBe("Squirtle")
        expect(pokemons.favorite.type).toBe("water") //Lie in this test, but it's a part of the schema and history for demonstration purposes.'
    })

})
