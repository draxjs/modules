import {z} from 'zod';

const DynamicFormSchema = z.object({
    identifier: z.string().min(1, 'validation.required'),
    fields: z.array(
        z.object({
            type: z.enum(['string', 'longString', 'number', 'boolean', 'date', 'object', 'ref', 'enum', 'password', 'file', 'array.string', 'array.number', 'array.object', 'array.ref', 'array.enum', 'array.file']),
            name: z.string().min(1, 'validation.required'),
            default: z.string().optional(),
            required: z.boolean().default(false),
            validationRegex: z.string().optional(),
            options: z.array(z.string()).optional().default([]),
        })
    )
});

export default DynamicFormSchema;
export {DynamicFormSchema}
