
import { z } from 'zod';


const UserLoginFailBaseSchema = z.object({
      user: z.string().min(1,'validation.required'),
    agent: z.string().optional(),
    ip: z.string().optional(),
    createdAt: z.coerce.date().nullable().optional()
});

const UserLoginFailSchema = UserLoginFailBaseSchema
    .extend({
      _id: z.string(),
       user: z.object({_id: z.string(), username: z.string()})
    })

export default UserLoginFailSchema;
export {UserLoginFailSchema, UserLoginFailBaseSchema}
