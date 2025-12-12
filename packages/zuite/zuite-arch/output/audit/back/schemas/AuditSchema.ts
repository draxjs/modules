
import { z } from 'zod';


const AuditBaseSchema = z.object({
      entity: z.string().min(1,'validation.required'),
    user: z.object({    id: z.string().min(1,'validation.required'),
    username: z.string().min(1,'validation.required'),
    rolName: z.string().min(1,'validation.required')}),
    action: z.string().min(1,'validation.required'),
    ip: z.string().min(1,'validation.required'),
    userAgent: z.string().min(1,'validation.required'),
    changes: z.array(
z.object({    field: z.string().min(1,'validation.required'),
    old: z.string().optional(),
    new: z.string().optional()})
    ).optional(),
    sessionId: z.string().optional(),
    requestId: z.string().optional(),
    detail: z.string().optional(),
    tenant: z.object({    id: z.string().min(1,'validation.required'),
    name: z.string().min(1,'validation.required')})
});

const AuditSchema = AuditBaseSchema
    .extend({
      _id: z.string(),
       
    })

export default AuditSchema;
export {AuditSchema, AuditBaseSchema}
