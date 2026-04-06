
import { z } from 'zod';


const LanguageBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    icon: z.object({
                filename: z.string().optional(),
                filepath: z.string().optional(),
                size: z.number().optional(),
                mimetype: z.string().optional(),
                url: z.string().optional()
                }).optional().nullable().default(null)
});

const LanguageSchema = LanguageBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default LanguageSchema;
export {LanguageSchema, LanguageBaseSchema}
