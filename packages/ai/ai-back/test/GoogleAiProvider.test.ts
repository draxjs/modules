import {describe, expect, test} from "vitest";
import {AiProviderFactory, GoogleAiProvider} from "../src";
import {IPromptTool} from "../src/interfaces/IAIProvider";

describe("GoogleAiProvider Test", () => {

    test("GoogleAi prompt supports image inputs and vision model fallback", async () => {
        let request: any

        class MockedGoogleAiProvider extends GoogleAiProvider {
            constructor() {
                super("test-key", "gemini-2.5-flash", "gemini-2.5-flash")
                this._client = {
                    models: {
                        generateContent: async (payload: any) => {
                            request = payload
                            return {
                                text: "{\"name\":\"invoice\"}",
                                usageMetadata: {
                                    totalTokenCount: 10,
                                    promptTokenCount: 7,
                                    candidatesTokenCount: 3,
                                }
                            }
                        }
                    }
                } as any
            }
        }

        const googleAi = new MockedGoogleAiProvider()

        const r = await googleAi.prompt({
            systemPrompt: "Extract invoice data",
            userInput: "Read this invoice",
            userImages: [{url: "data:image/png;base64,abc123", detail: "high"}]
        })

        expect(r.output).toBe("{\"name\":\"invoice\"}")
        expect(request.model).toBe("gemini-2.5-flash")
        expect(request.contents[0]).toEqual({
            role: "user",
            parts: [
                {text: "Read this invoice"},
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: "abc123",
                    }
                }
            ]
        })
    })

    test("GoogleAi prompt maps OpenAI jsonSchema format to Gemini responseJsonSchema", async () => {
        let request: any

        class MockedGoogleAiProvider extends GoogleAiProvider {
            constructor() {
                super("test-key", "gemini-2.5-flash")
                this._client = {
                    models: {
                        generateContent: async (payload: any) => {
                            request = payload
                            return {
                                text: "{\"name\":\"Pikachu\"}",
                                usageMetadata: {
                                    totalTokenCount: 8,
                                    promptTokenCount: 6,
                                    candidatesTokenCount: 2,
                                }
                            }
                        }
                    }
                } as any
            }
        }

        const jsonSchema = {
            type: "json_schema",
            json_schema: {
                name: "element_description",
                schema: {
                    type: "object",
                    properties: {
                        name: {type: "string"}
                    },
                    required: ["name"]
                }
            }
        }

        const googleAi = new MockedGoogleAiProvider()
        await googleAi.prompt({
            systemPrompt: "You are an AI assistant.",
            userInput: "What is the most famous pokemon",
            jsonSchema,
        })

        expect(request.config.responseMimeType).toBe("application/json")
        expect(request.config.responseJsonSchema).toEqual(jsonSchema.json_schema.schema)
    })

    test("GoogleAi prompt executes tools and sends function response back to model", async () => {
        const requests: any[] = []
        const weatherTool: IPromptTool = {
            name: "get_weather",
            description: "Get weather for a city",
            parameters: {
                type: "object",
                properties: {
                    city: {type: "string"}
                },
                required: ["city"],
                additionalProperties: false
            },
            execute: async ({city}) => ({city, temperature: 21})
        }

        class MockedGoogleAiProvider extends GoogleAiProvider {
            constructor() {
                super("test-key", "gemini-2.5-flash")
                this._client = {
                    models: {
                        generateContent: async (payload: any) => {
                            requests.push(payload)

                            if(requests.length === 1){
                                return {
                                    functionCalls: [{
                                        id: "call_123",
                                        name: "get_weather",
                                        args: {city: "Buenos Aires"}
                                    }],
                                    candidates: [{
                                        content: {
                                            role: "model",
                                            parts: [{
                                                functionCall: {
                                                    id: "call_123",
                                                    name: "get_weather",
                                                    args: {city: "Buenos Aires"}
                                                }
                                            }]
                                        }
                                    }],
                                    usageMetadata: {
                                        totalTokenCount: 15,
                                        promptTokenCount: 10,
                                        candidatesTokenCount: 5,
                                    }
                                }
                            }

                            return {
                                text: "21 grados",
                                usageMetadata: {
                                    totalTokenCount: 9,
                                    promptTokenCount: 7,
                                    candidatesTokenCount: 2,
                                }
                            }
                        }
                    }
                } as any
            }
        }

        const googleAi = new MockedGoogleAiProvider()
        const r = await googleAi.prompt({
            systemPrompt: "You are an AI assistant.",
            userInput: "How is the weather in Buenos Aires?",
            tools: [weatherTool]
        })

        expect(r.output).toBe("21 grados")
        expect(r.tokens).toBe(24)
        expect(requests[0].config.tools).toEqual([{
            functionDeclarations: [{
                name: "get_weather",
                description: "Get weather for a city",
                parametersJsonSchema: weatherTool.parameters,
            }]
        }])
        expect(requests[1].contents[2]).toEqual({
            role: "user",
            parts: [{
                functionResponse: {
                    id: "call_123",
                    name: "get_weather",
                    response: {
                        output: {
                            city: "Buenos Aires",
                            temperature: 21,
                        }
                    }
                }
            }]
        })
    })

    test("AiProviderFactory supports GoogleAi option", () => {
        process.env.GOOGLE_AI_API_KEY = "test-key"
        process.env.GOOGLE_AI_MODEL = "gemini-2.5-flash"
        process.env.GOOGLE_AI_VISION_MODEL = "gemini-2.5-flash"
        process.env.DRAX_DB_ENGINE = "mongo"

        const googleAi = AiProviderFactory.instance("GoogleAi")
        expect(googleAi).toBeInstanceOf(GoogleAiProvider)
    })
})
