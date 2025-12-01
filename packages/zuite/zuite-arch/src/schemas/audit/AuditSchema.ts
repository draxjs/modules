import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "audit",
    name: "Audit",
    apiBasePath: 'audits',
    apiTag: 'Audit',
    schema: {
        entity: {type: 'string', required: true, unique: false, index: true, search: true, header: true},
        user: {
            type: 'object', required: true, unique: false, index: false, search: false, header: true,
            schema: {
                id: {type: 'string', required: true, unique: false, index: true},
                username: {type: 'string', required: true, unique: false, index: false},
                rolName: {type: 'string', required: true, unique: false, index: false}
            }
        },
        action: {type: 'string', required: true, unique: false, index: true, search: true, header: true},
        ip: {type: 'string', required: true, unique: false, index: false, search: false, header: true},
        userAgent: {type: 'string', required: true, unique: false, index: false, search: false, header: true},
        changes: {
            type: 'array.object', required: false, unique: false, index: false, search: false, header: true,
            schema: {
                field: {type: 'string', required: true, unique: false, index: false},
                old: {type: 'string', required: false, unique: false, index: false},
                new: {type: 'string', required: false, unique: false, index: false}
            }
        },
        sessionId: {type: 'string', required: false, unique: false, index: true, search: true, header: true},
        requestId: {type: 'string', required: false, unique: false, index: true, search: true, header: true},
        detail: {type: 'longString', required: false, unique: false, index: false, search: false, header: true},
        tenant: {
            type: 'object', required: false, unique: false, index: false, search: false, header: true,
            schema: {
                id: {type: 'string', required: true, unique: false, index: true},
                name: {type: 'string', required: true, unique: false, index: false}
            }
        }
    }
}

export default schema;
export {schema};
