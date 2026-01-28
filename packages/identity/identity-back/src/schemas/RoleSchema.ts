import { object, string, array, boolean, iso} from "zod"

const RoleBaseSchema = object({
    name: string({ error: "validation.required" })
        .min(1, "validation.required")
        .regex(/^[A-Z]/, "validation.startWithUpperCase"),
    permissions: array(string()).optional(),
    icon: string().optional(),
    color: string().optional(),
    childRoles: array(string()).optional(),
})

const RoleSchema = RoleBaseSchema.extend({
    _id: string(),
    id: string().optional(),
    permissions: array(string()).optional(),
    icon: string().optional(),
    color: string().optional(),
    readonly: boolean(),
    childRoles: array(object({
        _id: string(),
        id: string().optional(),
        name: string()
    })).optional(),
    createdAt: iso.datetime().optional(),
    updatedAt: iso.datetime().optional()
})



export default RoleSchema

export {RoleSchema, RoleBaseSchema}
