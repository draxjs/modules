
import { z } from 'zod';


const LanguageBaseSchema = z.object({
      name: z.string().min(1,'validation.required')
});

const LanguageSchema = LanguageBaseSchema
    .extend({
      _id: z.string(),
       
    })

export default LanguageSchema;
export {LanguageSchema, LanguageBaseSchema}
