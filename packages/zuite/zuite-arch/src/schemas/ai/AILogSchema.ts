import { IEntitySchema } from "@drax/arch";

const schema: IEntitySchema = {
    module: "ai",
    name: "AILog",
    tabs: ["REQUEST", "FILES", "USAGE", "RESULT", "MANAGE"],
    schema: {
        provider: { groupTab: "REQUEST", type: "string", required: false, unique: false, index: true, search: true, header: true },
        model: { groupTab: "REQUEST", type: "string", required: false, unique: false, index: true, search: true, header: true },
        operationTitle: { groupTab: "REQUEST", type: "string", required: false, unique: false, index: false, search: true, header: true },
        operationGroup: { groupTab: "REQUEST", type: "string", required: false, unique: false, index: false, search: true, header: true },
        ip: { groupTab: "REQUEST", type: "string", required: false, unique: false, index: false, search: true, header: false },
        userAgent: { groupTab: "REQUEST", type: "longString", required: false, unique: false, index: false, search: true, header: false },
        input: { groupTab: "REQUEST", type: "longString", required: false, unique: false, index: false, search: true, header: false },

        inputImages: {
            groupTab: "FILES",
            type: "array.object",
            required: false,
            unique: false,
            index: false,
            header: false,
            schema: {
                filename: { type: "string", required: false, unique: false, index: false },
                filepath: { type: "string", required: false, unique: false, index: false },
                size: { type: "number", required: false, unique: false, index: false },
                mimetype: { type: "string", required: false, unique: false, index: false },
                url: { type: "string", required: false, unique: false, index: false },
            }
        },
        inputFiles: {
            groupTab: "FILES",
            type: "array.object",
            required: false,
            unique: false,
            index: false,
            header: false,
            schema: {
                filename: { type: "string", required: false, unique: false, index: false },
                filepath: { type: "string", required: false, unique: false, index: false },
                size: { type: "number", required: false, unique: false, index: false },
                mimetype: { type: "string", required: false, unique: false, index: false },
                url: { type: "string", required: false, unique: false, index: false },
            }
        },

        inputTokens: { groupTab: "USAGE", type: "number", required: false, unique: false, index: false, header: true },
        outputTokens: { groupTab: "USAGE", type: "number", required: false, unique: false, index: false, header: true },
        tokens: { groupTab: "USAGE", type: "number", required: false, unique: false, index: false, header: true },
        startedAt: { groupTab: "USAGE", type: "date", required: false, unique: false, index: false, header: true },
        endedAt: { groupTab: "USAGE", type: "date", required: false, unique: false, index: false, header: true },
        responseTime: { groupTab: "USAGE", type: "string", required: false, unique: false, index: false, header: true },

        output: { groupTab: "RESULT", type: "longString", required: false, unique: false, index: false, search: true, header: false },
        success: { groupTab: "RESULT", type: "boolean", required: false, unique: false, index: false, header: true },
        statusCode: { groupTab: "RESULT", type: "number", required: false, unique: false, index: false, header: true },
        errorMessage: { groupTab: "RESULT", type: "longString", required: false, unique: false, index: false, search: true, header: false },

        tenant: { groupTab: "MANAGE", type: "ref", ref: "Tenant", refDisplay: "name", required: false, unique: false, index: false, header: true },
        user: { groupTab: "MANAGE", type: "ref", ref: "User", refDisplay: "username", required: false, unique: false, index: false, header: true },
    }
};

export default schema;
export { schema };
