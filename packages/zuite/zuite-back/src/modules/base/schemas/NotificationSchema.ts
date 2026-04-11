import {z} from 'zod';


const NotificationBaseSchema = z.object({
    title: z.string().min(1, 'validation.required'),
    message: z.string().min(1, 'validation.required'),
    type: z.enum(['info', 'success', 'warning', 'error']),
    status: z.enum(['unread', 'read']).default('unread'),
    user: z.coerce.string().min(1, 'validation.required'),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
    readAt: z.date().optional()
});

const NotificationSchema = NotificationBaseSchema
    .extend({
        _id: z.coerce.string(),
        user: z.object({_id: z.coerce.string(), username: z.string()}),
        readAt: z.date().optional(),
        createdAt: z.date(),
        updatedAt: z.date().optional(),
    })

export default NotificationSchema;
export {NotificationSchema, NotificationBaseSchema}
