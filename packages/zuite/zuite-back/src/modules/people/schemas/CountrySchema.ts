
import { z } from 'zod';


const CountryBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional().default('Some Description'),
    flag: z.string().optional()
});

const CountrySchema = CountryBaseSchema
    .extend({
      _id: z.string(),
       
    })

export default CountrySchema;
export {CountrySchema, CountryBaseSchema}
