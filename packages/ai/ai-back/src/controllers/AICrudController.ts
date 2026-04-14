import {z} from "zod";
import {CommonController} from "@drax/common-back";
import AiProviderFactory from "../factory/AiProviderFactory.js";
import AIPermissions from "../permissions/AIPermissions.js";

const CrudAiFieldSchema: z.ZodType<any> = z.lazy(() => z.object({
    name: z.string(),
    type: z.string(),
    label: z.string(),
    hint: z.string().nullable().default(null),
    placeholder: z.string().nullable().default(null),
    readonly: z.boolean().nullable().default(null),
    default: z.any().nullable().default(null),
    enum: z.array(z.string()).nullable().default(null),
    items: z.array(z.object({
        title: z.string().nullable().default(null),
        value: z.any().nullable().default(null),
    })).nullable().default(null),
    ref: z.string().nullable().default(null),
    refDisplay: z.string().nullable().default(null),
    objectFields: z.array(CrudAiFieldSchema).nullable().default(null),
}))

const PromptRequestSchema = z.object({
    prompt: z.string().min(1),
    operation: z.enum(["create", "edit"]).default("create"),
    entity: z.object({
        name: z.string(),
        identifier: z.string().optional().nullable(),
    }),
    currentValues: z.record(z.string(), z.any()).default({}),
    fields: z.array(CrudAiFieldSchema).min(1),
})

class AICrudController extends CommonController {

    protected buildFieldValueSchema(field: any): z.ZodTypeAny {
        switch (field.type) {
            case "number":
                return z.number().nullable().default(null)
            case "boolean":
                return z.boolean().nullable().default(null)
            case "array.string":
            case "array.enum":
            case "array.ref":
                return z.array(z.string()).nullable().default(null)
            case "array.number":
                return z.array(z.number()).nullable().default(null)
            case "object":
                if (field.objectFields && Array.isArray(field.objectFields) && field.objectFields.length > 0) {
                    return z.object(this.buildFieldShape(field.objectFields)).nullable().default(null)
                }
                return z.string().nullable().default(null)
            case "record":
            case "array.object":
            case "array.record":
            case "array.fullFile":
            case "file":
            case "fullFile":
                return z.string().nullable().default(null)
            case "id":
            case "string":
            case "longString":
            case "date":
            case "ref":
            case "enum":
            case "select":
            case "password":
            default:
                return z.string().nullable().default(null)
        }
    }

    protected buildFieldShape(fields: any[]): Record<string, z.ZodTypeAny> {
        return fields.reduce((acc, field) => {
            acc[field.name] = this.buildFieldValueSchema(field)
            return acc
        }, {} as Record<string, z.ZodTypeAny>)
    }

    protected buildSystemPrompt(input: z.infer<typeof PromptRequestSchema>) {
        return [
            "Sos un asistente de formularios para un sistema CRUD.",
            "Tu tarea es proponer valores JSON para completar o editar una entidad.",
            "Debes respetar exactamente los nombres de campo entregados.",
            "No inventes campos adicionales.",
            "Si un campo no tiene una propuesta razonable, omitilo.",
            "Usa tipos compatibles con JSON.",
            "Para campos enum o select, elegí solamente valores válidos de la lista provista.",
            "Para campos record, object sin estructura fija, array.object o array.record, devolve un string JSON serializado valido.",
            "La respuesta debe describir sugerencias concretas, breves y aplicables.",
            `Operacion actual: ${input.operation}.`,
            `Entidad actual: ${input.entity.name}.`,
        ].join("\n")
    }

    protected buildUserInput(input: z.infer<typeof PromptRequestSchema>) {
        return JSON.stringify({
            task: input.prompt,
            operation: input.operation,
            entity: input.entity,
            currentValues: input.currentValues,
            fields: input.fields,
            expectedResponse: {
                message: "string",
                suggestions: "object with proposed values indexed by field name",
                warnings: ["optional string warnings"],
            }
        })
    }

    async prompt(req, rep) {
        try {
            req.rbac.assertPermission(AIPermissions.PromptCrud)

            const input = PromptRequestSchema.parse(req.body ?? {})
            const aiProvider = AiProviderFactory.instance()

            const responseSchema = z.object({
                message: z.string().nullable().default(null),
                suggestions: z.object(this.buildFieldShape(input.fields)).strict().default({}),
                warnings: z.array(z.string()).default([]),
            })

            const response = await aiProvider.prompt({
                systemPrompt: this.buildSystemPrompt(input),
                userInput: this.buildUserInput(input),
                zodSchema: responseSchema,
                operationTitle: `crud-${input.operation}-assistant`,
                operationGroup: "crud-form-assistant",
                ip: req.ip,
                userAgent: req.headers["user-agent"],
                tenant: req.rbac?.tenantId ?? null,
                user: req.rbac?.userId ?? null,
            })

            const parsedOutput = responseSchema.parse(
                typeof response.output === "string"
                    ? JSON.parse(response.output)
                    : response.output
            )

            return rep.send({
                message: parsedOutput.message,
                suggestions: parsedOutput.suggestions,
                warnings: parsedOutput.warnings,
                meta: {
                    tokens: response.tokens,
                    inputTokens: response.inputTokens,
                    outputTokens: response.outputTokens,
                    time: response.time,
                }
            })
        } catch (e: any) {
            console.error("AIController.prompt error", e)

            const statusCode = e?.name === "ZodError" ? 400 : 500

            return rep.status(statusCode).send({
                message: e?.message || "AI prompt error",
            })
        }
    }

}

export default AICrudController;
export {AICrudController};
