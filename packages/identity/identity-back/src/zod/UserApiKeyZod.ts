import {array, object, string} from "zod"

const userApiKeyBaseSchema = object({
    name: string({ required_error: "validation.required" })
        .min(1, "validation.required"),
    ipv4: array(string().ip({version: "v4", message: 'validation.invalidIpv4'})),
    ipv6: array(string().ip({version: "v6", message: 'validation.invalidIpv6'})),

})

const userApiKeySchema = userApiKeyBaseSchema.extend({
    id: string(),
    createdBy: string(),
})


export default userApiKeyBaseSchema

export {userApiKeyBaseSchema, userApiKeySchema}
