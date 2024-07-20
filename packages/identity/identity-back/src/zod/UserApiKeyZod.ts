import { object, string } from "zod"

const userApiKeySchema = object({
    name: string({ required_error: "validation.required" })
        .min(1, "validation.required"),


})


export default userApiKeySchema

export {userApiKeySchema}
