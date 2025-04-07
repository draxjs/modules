import {describe, test, expect} from 'vitest'
import {OpenAiProvider, OpenAiProviderFactory} from "../src";
import z from "zod";
import {IPromptMemory, IPromptMessage} from "../src/interfaces/IAIProvider";


describe('OpenAi Test', () => {

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
