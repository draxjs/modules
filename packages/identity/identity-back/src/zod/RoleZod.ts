import { object, string } from "zod"

const roleSchema = object({
    name: string({ required_error: "validation.required" })
        .min(1, "validation.required")
        .regex(/^[A-Z]/, "validation.startWithUpperCase"),


})


export default roleSchema

export {roleSchema}
