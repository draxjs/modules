import {z} from 'zod';


const DashboardBaseSchema = z.object({
    identifier: z.string().min(1, 'validation.required'),
    title: z.string().min(1, 'validation.required'),
    cards: z.array(
        z.object({
            entity: z.string().min(1, 'validation.required'),
            type: z.enum(['paginate', 'groupBy']),
            title: z.string().min(1, 'validation.required'),
            filters: z.array(
                z.object({
                    field: z.string().min(1, 'validation.required'),
                    operator: z.string().min(1, 'validation.required'),
                    value: z.string().min(1, 'validation.required')
                })
            ).optional(),
            layout: z.object({
                cols: z.number().min(0, 'validation.required').default(12),
                sm: z.number().min(0, 'validation.required').default(12),
                md: z.number().min(0, 'validation.required').default(12),
                lg: z.number().min(0, 'validation.required').default(12),
                height: z.number().min(0, 'validation.required').default(100),
                cardVariant: z.enum(['text', 'flat', 'elevated', 'tonal', 'outlined', 'plain']).default('elevated')
            }),
            groupBy: z.object({
                fields: z.array(z.string()),
                dateFormat: z.enum(['year', 'month', 'day', 'hour', 'minute', 'second']).optional().default('day'),
                render: z.enum(['table', 'gallery', 'pie', 'bars']).optional().default('table')
            }),
            paginate: z.object({
                columns: z.array(z.string()).default([]),
                orderBy: z.string().optional().nullable(),
                order: z.enum(['asc', 'desc']).optional().nullable()
            })
        })
    ).optional()
});

const DashboardSchema = DashboardBaseSchema
    .extend({
        _id: z.string(),

    })

export default DashboardSchema;
export {DashboardSchema, DashboardBaseSchema}
