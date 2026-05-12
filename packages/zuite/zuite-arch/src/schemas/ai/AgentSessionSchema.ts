import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "ai",
    name: "AgentSession",
    tabs: [ "MESSAGES",  "USAGE", "MANAGE"],
    schema: {
        sessionId: { type: "string", required: true, unique: false, index: true, search: true, header: true},
        title: { type: "string", required: false, unique: false, index: false, search: true, header: true},

        lastMessageAt: {groupTab: "SESSION", type: "date", required: false, unique: false, index: true, header: true},

        messages: {
            groupTab: "MESSAGES",
            type: "array.object",
            required: false,
            unique: false,
            index: false,
            header: false,
            schema: {
                role: {type: "enum", enum: ["user", "assistant", "system"], required: true, unique: false, index: false},
                content: {type: "longString", required: true, unique: false, index: false, search: true},
                createdAt: {type: "date", required: false, unique: false, index: false},
            },
        },

        messageCount: {groupTab: "USAGE", type: "number", required: false, unique: false, index: false, header: true},
        inputTokens: {groupTab: "USAGE", type: "number", required: false, unique: false, index: false, header: true},
        outputTokens: {groupTab: "USAGE", type: "number", required: false, unique: false, index: false, header: true},
        tokens: {groupTab: "USAGE", type: "number", required: false, unique: false, index: false, header: true},

        tenant: {groupTab: "MANAGE", type: "ref", ref: "Tenant", refDisplay: "name", required: false, unique: false, index: true, header: true},
        user: {groupTab: "MANAGE", type: "ref", ref: "User", refDisplay: "username", required: false, unique: false, index: true, header: true},
    },
};

export default schema;
export {schema};
