import {z} from 'zod';


const TokenPayloadSchema = z.object({
    id: z.string(),
    username: z.string(),

    session: z.string(),

    roleId: z.string(),
    roleName: z.string().optional().nullable(),

    tenantId: z.string().optional().nullable(),
    tenantName: z.string().optional().nullable(),

    apiKeyId: z.string().optional().nullable(),
    apiKeyName: z.string().optional().nullable(),

});


export default TokenPayloadSchema;
export {TokenPayloadSchema}
