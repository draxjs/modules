import {z} from 'zod';


const UserLoginFailBaseSchema = z.object({
    username: z.string().min(1, 'validation.required'),
    userAgent: z.string().optional(),
    ip: z.string().optional(),

});

const UserLoginFailSchema = UserLoginFailBaseSchema
    .extend({
        _id: z.string(),
        createdAt: z.coerce.date().nullable().optional()
    })

export default UserLoginFailSchema;
export {UserLoginFailSchema, UserLoginFailBaseSchema}
