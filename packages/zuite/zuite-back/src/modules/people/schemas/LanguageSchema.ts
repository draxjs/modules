
import { z } from 'zod';


const LanguageBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    icon: z.object({
                filename: z.string().min(1,'validation.required'),
                filepath: z.string().min(1,'validation.required'),
                size: z.number().min(1,'validation.required'),
                mimetype: z.string().optional(),
                url: z.string().min(1,'validation.required')
                }).optional()
});

const LanguageSchema = LanguageBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default LanguageSchema;
export {LanguageSchema, LanguageBaseSchema}
