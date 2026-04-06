
import { z } from 'zod';


const FileBaseSchema = z.object({
      filename: z.string().min(1,'validation.required'),
    relativePath: z.string().min(1,'validation.required'),
    absolutePath: z.string().min(1,'validation.required'),
    url: z.string().min(1,'validation.required'),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    mimetype: z.string().min(1,'validation.required'),
    encoding: z.string().min(1,'validation.required'),
    extension: z.string().min(1,'validation.required'),
    size: z.number().min(0,'validation.required'),
    type: z.string().min(1,'validation.required'),
    lastAccess: z.coerce.date({error: "validation.date"}),
    createdAt: z.coerce.date({error: "validation.date"}),
    updatedAt: z.coerce.date({error: "validation.date"}),
    createdBy: z.coerce.string().optional(),
    updatedBy: z.object({    id: z.string().optional(),
    username: z.string().optional()}),
    createdFor: z.string().optional(),
    ttlSeconds: z.number().min(0,'validation.required'),
    expiresAt: z.coerce.date().nullable().optional(),
    isPublic: z.boolean().optional(),
    hits: z.number().nullable().optional()
});

const FileSchema = FileBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default FileSchema;
export {FileSchema, FileBaseSchema}
