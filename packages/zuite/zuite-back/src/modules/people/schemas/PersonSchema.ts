
import { z } from 'zod';


const PersonBaseSchema = z.object({
      fullname: z.string().min(1,'validation.required'),
    live: z.boolean().optional(),
    birthdate: z.coerce.date().nullable().optional(),
    secret: z.string().optional(),
    nationality: z.string().optional().nullable(),
    hobbies: z.array(z.string()).optional(),
    race: z.enum(['human', 'elf', 'orc']).optional(),
    interests: z.array(z.enum(['sports', 'music', 'reading', 'travel', 'cooking', 'technology'])).optional(),
    languages: z.array(z.string()).optional(),
    address: z.object({    country: z.string().optional(),
    city: z.string().optional(),
    street: z.string().min(1,'validation.required'),
    zip: z.number().nullable().optional(),
    casa: z.boolean().optional()}),
    skills: z.array(
z.object({    name: z.string().min(1,'validation.required'),
    level: z.number().nullable().optional()})
    ).optional(),
    tenant: z.string().optional().nullable(),
    user: z.string().optional().nullable()
});

const PersonSchema = PersonBaseSchema
    .extend({
      _id: z.string(),
       nationality: z.object({_id: z.string(), name: z.string()}).nullable().optional(),
languages: z.array(z.object({_id: z.string(), name: z.string()})).optional(),
tenant: z.object({_id: z.string(), name: z.string()}).nullable().optional(),
user: z.object({_id: z.string(), username: z.string()}).nullable().optional()
    })

export default PersonSchema;
export {PersonSchema, PersonBaseSchema}
