import {z} from 'zod';


const CovenantBaseSchema = z.object({
    date: z.coerce.date({error: "validation.date"}),
    link: z.string().optional(),
    since: z.string().min(1, 'validation.required'),
    until: z.string().min(1, 'validation.required'),
    month: z.string().min(1, 'validation.required'),
    fullname: z.string().min(1, 'validation.required'),
    dni: z.string().min(1, 'validation.required'),
    locality: z.string().min(1, 'validation.required'),
    address: z.string().min(1, 'validation.required'),
    amount: z.coerce.number().min(0, 'validation.required'),
    comment: z.string().optional(),
    group: z.coerce.string().min(1, 'validation.required'),
    createdBy: z.coerce.string().optional(),
    updatedBy: z.coerce.string().min(1, 'validation.required'),
    status: z.enum(['activo', 'rechazado']).optional().default('activo'),
    refuseComment: z.string().optional(),
    refuseBy: z.coerce.string().optional().nullable()
});

const CovenantSchema = CovenantBaseSchema
    .extend({
        _id: z.coerce.string(),
        group: z.object({_id: z.coerce.string(), name: z.string()}),
        createdBy: z.object({_id: z.coerce.string(), name: z.string()}),
        updatedBy: z.object({_id: z.coerce.string(), name: z.string()}),
        refuseBy: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional()
    })

export default CovenantSchema;
export {CovenantSchema, CovenantBaseSchema}
