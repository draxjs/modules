import { object, string } from "zod"

const tenantSchema = object({
    name: string({ required_error: "validation.required" })
        .min(1, "validation.required")
        .regex(/^[A-Z]/, "validation.startWithUpperCase"),


})


export default tenantSchema

export {tenantSchema}
