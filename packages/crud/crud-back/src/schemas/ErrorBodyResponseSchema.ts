import z from "zod"

const ErrorBodyResponseSchema = z.object({
    statusCode: z.string().optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    i18nMessage: z.string().optional()
}).passthrough();

const ValidationErrorBodyResponseSchema = ErrorBodyResponseSchema.extend({
    inputErrors: z.array(z.object({
        field: z.string(),
        reason: z.string(),
        value: z.any().optional(),
    })).optional()
}).passthrough();

export default ErrorBodyResponseSchema

export {ErrorBodyResponseSchema, ValidationErrorBodyResponseSchema}
