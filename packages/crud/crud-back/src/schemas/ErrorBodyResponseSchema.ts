import z from "zod"

const ErrorBodyResponseSchema = z.object({
    statusCode: z.string(),
    error: z.string(),
    message: z.string(),
    i18nMessage: z.string()
});

const ValidationErrorBodyResponseSchema = ErrorBodyResponseSchema.extend({
    inputErrors: z.array(z.object({
        field: z.string(),
        reason: z.string(),
        value: z.any().optional(),
    })).optional()
});

export default ErrorBodyResponseSchema

export {ErrorBodyResponseSchema, ValidationErrorBodyResponseSchema}
