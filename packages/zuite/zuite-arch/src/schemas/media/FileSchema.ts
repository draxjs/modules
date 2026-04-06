import { IEntitySchema } from "@drax/arch";

const schema: IEntitySchema = {
    module: "media",
    name: "File",
    schema: {
        filename: { type: 'string', required: true, search: true, header: true },
        relativePath: { type: 'string', required: true, index: true, search: true, header: false },
        absolutePath: { type: 'string', required: true, search: true, header: false },
        url: { type: 'string', required: true, search: true, header: true },
        description: { type: 'longString', required: false, search: true, header: false },
        tags: { type: 'array.string', required: false, search: true, header: false },
        mimetype: { type: 'string', required: true, search: true, header: true },
        encoding: { type: 'string', required: true, header: false },
        extension: { type: 'string', required: true, search: true, header: true },
        size: { type: 'number', required: true, header: true },
        type: { type: 'string', required: true, search: true, header: true },
        lastAccess: { type: 'date', required: true, header: true },
        createdAt: { type: 'date', required: true, header: true },
        updatedAt: { type: 'date', required: true, header: false },
        createdBy: {
            type: 'object', required: false, header: false, schema: {
                id: { type: 'string', required: false },
                username: { type: 'string', required: false }
            }
        },
        updatedBy: {
            type: 'object', required: false, header: false, schema: {
                id: { type: 'string', required: false },
                username: { type: 'string', required: false }
            }
        },
        createdFor: { type: 'string', required: false, header: false },
        ttlSeconds: { type: 'number', required: true, header: false },
        expiresAt: { type: 'date', required: false, header: false },
        isPublic: { type: 'boolean', default: true, header: true },
        hits: { type: 'number', default: 0, header: true }
    }
}

export default schema;
export { schema };
