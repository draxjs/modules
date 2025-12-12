
import { z } from 'zod';


const UserSessionBaseSchema = z.object({
      uuid: z.string().min(1,'validation.required'),
    user: z.string().min(1,'validation.required'),
    agent: z.string().optional(),
    ip: z.string().optional(),
    createdAt: z.coerce.date().nullable().optional()
});

const UserSessionSchema = UserSessionBaseSchema
    .extend({
      _id: z.string(),
       user: z.object({_id: z.string(), username: z.string()})
    })

export default UserSessionSchema;
export {UserSessionSchema, UserSessionBaseSchema}
