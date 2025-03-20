import {date, object, string, array, boolean} from "zod"

const RoleBaseSchema = object({
    name: string({ required_error: "validation.required" })
        .min(1, "validation.required")
        .regex(/^[A-Z]/, "validation.startWithUpperCase"),
    permissions: array(string()).optional(),
    childRoles: array(string()).optional(),
})

const RoleSchema = RoleBaseSchema.extend({
    _id: string(),
    id: string().optional(),
    permissions: array(string()).optional(),
    readonly: boolean(),
    childRoles: array(object({
        _id: string(),
        id: string().optional(),
        name: string()
    })).optional(),
    createdAt: date().optional(),
    updatedAt: date().optional()
})



export default RoleSchema

export {RoleSchema, RoleBaseSchema}
