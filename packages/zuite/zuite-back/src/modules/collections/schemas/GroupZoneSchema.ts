
import { z } from 'zod';


const GroupZoneBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    users: z.array(z.coerce.string()).optional()
});

const GroupZoneSchema = GroupZoneBaseSchema
    .extend({
      _id: z.coerce.string(),
       users: z.array(z.object({_id: z.coerce.string(), username: z.string()})).optional()
    })

export default GroupZoneSchema;
export {GroupZoneSchema, GroupZoneBaseSchema}
