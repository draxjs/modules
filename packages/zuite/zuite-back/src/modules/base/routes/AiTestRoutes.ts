import AiTestController from "../controllers/AiTestController.js";

async function AiTestRoutes(fastify, options) {
    const controller = new AiTestController();

    fastify.post(
        "/api/ai-test/prompt",
        {
            schema: {
                tags: ["Base"],
                summary: "Test AI prompt execution using OpenAI provider",
                body: {
                    type: "object",
                    required: ["systemPrompt"],
                    properties: {
                        systemPrompt: { type: "string" },
                        userInput: { type: "string" },
                        inputFiles: { type: "array" },
                        history: { type: "array" },
                        memory: { type: "array" },
                        knowledgeBase: { type: "array" },
                        knowledgeBaseHeader: { type: "string" },
                        memoryHeader: { type: "string" },
                        userImages: { type: "array" },
                        userContent: { type: "array" },
                        jsonSchema: { type: "object" },
                        visionImageMode: { type: "string", enum: ["url", "base64"] },
                        visionDetail: { type: "string", enum: ["auto", "low", "high"] },
                        model: { type: "string" },
                        operationTitle: { type: "string" },
                        operationGroup: { type: "string" }
                    }
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            output: {},
                            tokens: { type: "number" },
                            inputTokens: { type: "number" },
                            outputTokens: { type: "number" },
                            time: { type: "number" }
                        }
                    },
                    400: {
                        type: "object",
                        properties: {
                            error: { type: "string" }
                        }
                    },
                    401: {
                        type: "object",
                        properties: {
                            error: { type: "string" }
                        }
                    },
                    500: {
                        type: "object",
                        properties: {
                            error: { type: "string" }
                        }
                    }
                }
            }
        },
        (req, rep) => controller.prompt(req as any, rep)
    );
}

export default AiTestRoutes
export {
    AiTestRoutes
}
