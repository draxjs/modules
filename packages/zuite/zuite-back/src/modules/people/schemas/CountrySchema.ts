import {z} from 'zod';


const CountryBaseSchema = z.object({
    name: z.string().min(1, 'validation.required'),
    description: z.string().optional().default('Some Description'),
    flag: z.string().optional(),
    metadata: z.any().optional().nullable(),
    tenant: z.coerce.string().optional().nullable(),
    createdBy: z.coerce.string().optional()
});

const CountrySchema = CountryBaseSchema
    .extend({
        _id: z.coerce.string(),
        tenant: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        createdBy: z.object({_id: z.coerce.string(), username: z.string()}).optional(),
        createdAt: z.date()

    })

export default CountrySchema;
export {CountrySchema, CountryBaseSchema}
