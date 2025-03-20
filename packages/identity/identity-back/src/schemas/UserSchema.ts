import {date, object, string, boolean, array} from "zod"
import {RoleSchema} from "./RoleSchema.js"
import {TenantSchema} from "./TenantSchema.js"

const UserBaseSchema = object({
    name: string({ required_error: "validation.required" })
        .min(1, "validation.required"),
    username: string({ required_error: "validation.required" })
        .min(1, "validation.required"),
    email: string({ required_error: "validation.required" })
        .email("validation.email.invalid"),
    phone: string({ required_error: "validation.required" }).optional(),
    active: boolean().optional(),
    role: string({ required_error: "validation.required" })
        .min(1, "validation.required"),
    tenant: string({ required_error: "validation.required" }).nullable().optional()


})

const UserCreateSchema = UserBaseSchema.extend({
    password: string({ required_error: "validation.required" })
        .min(1, "validation.required")
        .min(8, "validation.password.min8")
        .max(64, "validation.password.max64"),
});


const UserUpdateSchema = UserBaseSchema.extend({

});

const UserSchema = UserBaseSchema
    .extend({
    _id: string(),
    role: object({
        _id: string(),
        id: string().optional(),
        name: string(),
        permissions: array(string())
    }).optional(),
    active: boolean(),
    tenant: object({
        _id: string(),
        id: string().optional(),
        name: string(),
    }).nullable().optional(),
    createdAt: date().optional()
});


export {
    UserBaseSchema,
    UserSchema,
    UserCreateSchema,
    UserUpdateSchema,
}
