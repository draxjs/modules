
import { z } from 'zod';


const CountryBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional().default('Some Description'),
    flag: z.string().optional(),
    tenant: z.string().min(1,'validation.required'),
    createdBy: z.string().min(1,'validation.required')
});

const CountrySchema = CountryBaseSchema
    .extend({
      _id: z.string(),
       tenant: z.object({_id: z.string(), name: z.string()}),
createdBy: z.object({_id: z.string(), username: z.string()})
    })

export default CountrySchema;
export {CountrySchema, CountryBaseSchema}
