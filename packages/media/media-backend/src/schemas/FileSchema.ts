import {z} from 'zod';


const FileBaseSchema = z.object({
    filename: z.string().min(1, 'validation.required'),
    relativePath: z.string().min(1, 'validation.required'),
    absolutePath: z.string().min(1, 'validation.required'),
    url: z.string().min(1, 'validation.required'),
    description: z.string().default('').nullish(),
    tags: z.array(z.string()).optional().default([]),
    mimetype: z.string().nullish(),
    encoding: z.string().nullish(),
    extension: z.string().nullish(),
    size: z.number().min(0, 'validation.required').nullish(),
    type: z.string().nullish(),
    lastAccess: z.coerce.date({error: "validation.date"}).nullish(),
    createdFor: z.string().nullish(),
    ttlSeconds: z.number().default(0).nullish(),
    expiresAt: z.coerce.date().nullish(),
    isPublic: z.boolean().nullish(),
    hits: z.number().default(0),
    createdBy: z.object({
        id: z.string().nullish(),
        username: z.string().nullish()
    }).nullish(),
    updatedBy: z.object({
        id: z.string().nullish(),
        username: z.string().nullish()
    }).nullish(),
    tenant: z.coerce.string().nullish(),
});

const FileSchema = FileBaseSchema
    // .omit({
    //     relativePath: true,
    //      absolutePath: true
    // })
    .extend({
        _id: z.coerce.string(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        expiresAt: z.coerce.date().nullish(),
        createdBy: z.object({
            id: z.coerce.string().nullish(),
            username: z.string().nullish()
        }).nullish(),
        updatedBy: z.object({
            id: z.coerce.string().nullish(),
            username: z.string().nullish()
        }).nullish(),
        tenant: z.object({
            _id: z.coerce.string(),
            name: z.string()
        }).nullish()
    })

export default FileSchema;
export {FileSchema, FileBaseSchema}
