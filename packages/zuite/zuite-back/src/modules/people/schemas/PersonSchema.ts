
import { z } from 'zod';

const PersonSchema = z.object({
      fullname: z.string().min(1,'validation.required'),
    live: z.boolean(),
    birthdate: z.coerce.date().nullable(),
    secret: z.string(),
    nationality: z.string().nullable(),
    hobbies: z.array(z.string()),
    race: z.enum(['human', 'elf', 'orc']),
    interests: z.array(z.enum(['sports', 'music', 'reading', 'travel', 'cooking', 'technology'])),
    languages: z.array(z.string()),
    address: z.object({    country: z.string(),
    city: z.string(),
    street: z.string().min(1,'validation.required'),
    zip: z.string()}),
    skills: z.array(
z.object({    name: z.string().min(1,'validation.required'),
    level: z.number()})
    ),
    tenant: z.string().nullable(),
    user: z.string().nullable()
});

export default PersonSchema;
export {PersonSchema}
