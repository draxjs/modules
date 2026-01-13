import {email, iso,  object, string, boolean, array, record, any} from "zod"

const UserBaseSchema = object({
    name: string({error: "validation.required"})
        .min(1, "validation.required"),
    username: string({error: "validation.required"})
        .min(1, "validation.required"),
    email: email("validation.email.invalid"),
    phone: string({error: "validation.required"}).optional(),
    active: boolean().optional(),
    role: string({error: "validation.required"})
        .min(1, "validation.required"),
    tenant: string({error: "validation.required"}).nullable().optional()


})

const UserCreateSchema = UserBaseSchema.extend({
    password: string({error: "validation.required"})
        .min(1, "validation.required")
        .min(8, "validation.password.min8")
        .max(64, "validation.password.max64"),
});


const UserUpdateSchema = UserBaseSchema.extend({});

const UserSchema = UserBaseSchema
    .extend({
        _id: string(),
        role: object({
            _id: string(),
            id: string().optional(),
            name: string(),
            icon: string().optional(),
            color: string().optional(),
            permissions: array(string()),
            childRoles: array(object({_id: string(), name:string()})).optional()
        }).optional(),
        active: boolean(),
        tenant: object({
            _id: string(),
            id: string().optional(),
            name: string(),
            custom: record(string(), any()).optional(),
        }).nullish(),
        createdAt: iso.datetime().optional(),
        avatar: string().optional()
    });


export {
    UserBaseSchema,
    UserSchema,
    UserCreateSchema,
    UserUpdateSchema,
}
