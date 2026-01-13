import {array, object, string, ipv4, ipv6} from "zod"

const UserApiKeyBaseSchema = object({
    name: string({ error: "validation.required" })
        .min(1, "validation.required"),
    ipv4: array(ipv4({ message: 'validation.invalidIpv4'})),
    ipv6: array(ipv6({ message: 'validation.invalidIpv6'})),

})

const UserApiKeySchema = UserApiKeyBaseSchema.extend({
    _id: string(),
    id: string().optional(),
    createdBy: string(),
})


export default UserApiKeyBaseSchema

export {UserApiKeyBaseSchema, UserApiKeySchema}
