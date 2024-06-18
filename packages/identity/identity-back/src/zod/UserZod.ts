import { object, string } from "zod"

export const userBaseSchema = object({
    name: string({ required_error: "validation.required" })
        .min(1, "validation.required"),
    username: string({ required_error: "validation.required" })
        .min(1, "validation.required"),
    email: string({ required_error: "validation.required" })
        .email("validation.email.invalid"),
    role: string({ required_error: "validation.required" })
        .min(1, "validation.required")

})

export const createUserSchema = userBaseSchema.extend({
    password: string({ required_error: "validation.required" })
        .min(1, "validation.required")
        .min(8, "validation.password.min8")
        .max(32, "validation.password.max32"),
});


export const editUserSchema = userBaseSchema.extend({

});

