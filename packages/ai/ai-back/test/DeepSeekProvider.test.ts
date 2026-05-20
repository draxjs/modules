import {describe, expect, test} from "vitest";
import {AiProviderFactory, DeepSeekAiProvider} from "../src";
import {IPromptTool} from "../src/interfaces/IAIProvider";

describe("DeepSeekProvider Test", () => {

    test("DeepSeek prompt uses OpenAI-compatible chat completions", async () => {
        let request: any

        class MockedDeepSeekProvider extends DeepSeekAiProvider {
            constructor() {
                super("test-key", "deepseek-chat")
                this._client = {
                    chat: {
                        completions: {
                            create: async (payload: any) => {
                                request = payload
                                return {
                                    choices: [{message: {content: "Buenos Aires"}}],
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

        const deepSeek = new MockedDeepSeekProvider()

        const r = await deepSeek.prompt({
            systemPrompt: "You are an AI assistant.",
            userInput: "What is the capital of Argentina?"
        })

        expect(r.output).toBe("Buenos Aires")
        expect(request.model).toBe("deepseek-chat")
        expect(request.messages[1]).toEqual({
            role: "user",
            content: "What is the capital of Argentina?"
        })
    })

    test("DeepSeek prompt executes tools through OpenAI-compatible tool calls", async () => {
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

        class MockedDeepSeekProvider extends DeepSeekAiProvider {
            constructor() {
                super("test-key", "deepseek-chat")
                this._client = {
                    chat: {
                        completions: {
                            create: async (payload: any) => {
                                requests.push(payload)

                                if(requests.length === 1){
                                    return {
                                        choices: [{
                                            message: {
                                                role: "assistant",
                                                content: null,
                                                tool_calls: [{
                                                    id: "call_123",
                                                    type: "function",
                                                    function: {
                                                        name: "get_weather",
                                                        arguments: "{\"city\":\"Buenos Aires\"}"
                                                    }
                                                }]
                                            }
                                        }],
                                        usage: {
                                            total_tokens: 15,
                                            prompt_tokens: 10,
                                            completion_tokens: 5
                                        }
                                    }
                                }

                                return {
                                    choices: [{message: {role: "assistant", content: "21 grados"}}],
                                    usage: {
                                        total_tokens: 9,
                                        prompt_tokens: 7,
                                        completion_tokens: 2
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        const deepSeek = new MockedDeepSeekProvider()
        const r = await deepSeek.prompt({
            systemPrompt: "You are an AI assistant.",
            userInput: "How is the weather in Buenos Aires?",
            tools: [weatherTool]
        })

        expect(r.output).toBe("21 grados")
        expect(r.tokens).toBe(24)
        expect(requests[0].tools).toEqual([{
            type: "function",
            function: {
                name: "get_weather",
                description: "Get weather for a city",
                parameters: weatherTool.parameters
            }
        }])
        expect(requests[1].messages[3]).toEqual({
            role: "tool",
            tool_call_id: "call_123",
            content: "{\"city\":\"Buenos Aires\",\"temperature\":21}"
        })
    })

    test("AiProviderFactory supports DeepSeek option", () => {
        process.env.DEEPSEEK_API_KEY = "test-key"
        process.env.DEEPSEEK_MODEL = "deepseek-chat"
        process.env.DEEPSEEK_BASE_URL = "https://api.deepseek.com"
        process.env.DEEPSEEK_VISION_MODEL = "deepseek-chat"
        process.env.DRAX_DB_ENGINE = "mongo"

        const deepSeek = AiProviderFactory.instance("DeepSeek")
        expect(deepSeek).toBeInstanceOf(DeepSeekAiProvider)
    })
})
