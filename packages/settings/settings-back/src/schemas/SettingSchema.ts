import { object, string } from "zod"

const settingSchema = object({
    key: string({ required_error: "validation.required" })
        .min(1, "validation.required"),
})


export default settingSchema

export {settingSchema}
