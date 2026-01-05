
import { z } from 'zod';


const CountryBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    //description: z.string().min(1,'validation.required'),
    description: z.string().optional().nullable(),
    flag: z.string().optional()
});

const CountrySchema = CountryBaseSchema
    .extend({
      _id: z.string(),
        company: z.object({_id: z.string(), name: z.string()}).nullable().optional(),
        createdBy: z.object({_id: z.string(), username: z.string()}).nullable().optional()
    })

export default CountrySchema;
export {CountrySchema, CountryBaseSchema}
