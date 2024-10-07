import {z} from 'zod';

const PersonSchema = z.object({
    fullname: z.string().min(1, 'validation.required'),
    live: z.boolean(),
    birthdate: z.coerce.date().nullable(),
    nationality: z.string().nullable(),
    hobbies: z.array(z.string()),
    languages: z.array(z.string()),
    address: z.object({
        country: z.string(),
        city: z.string(),
        street: z.string(),
        zip: z.string()
    }),
    skills: z.array(
        z.object({
            name: z.string(),
            level: z.number()
        })
    )
});

export default PersonSchema;
export {PersonSchema}
