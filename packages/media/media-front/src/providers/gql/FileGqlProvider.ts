import type {IGqlClient} from "@drax/common-front";
import type {
    IDraxCrudProviderExportResult,
    IDraxExportOptions,
    IDraxFindOneOptions,
    IDraxFindOptions,
    IDraxGroupByOptions,
    IDraxPaginateOptions,
    IDraxPaginateResult
} from "@drax/crud-share";
import type {IFile, IFileBase} from "@drax/media-share";
import type {IFileProvider} from "../../interfaces/IFileProvider";

class FileGqlProvider implements IFileProvider {

    gqlClient: IGqlClient

    constructor(gqlClient: IGqlClient) {
        this.gqlClient = gqlClient
    }

    get gqlFields() {
        return `_id filename relativePath absolutePath url description tags mimetype encoding extension size type lastAccess createdBy{id username} updatedBy{id username} createdFor ttlSeconds expiresAt isPublic hits createdAt updatedAt`
    }

    async create(payload: IFileBase): Promise<IFile> {
        const query = `mutation createFile($input: FileInput) { createFile(input: $input) { ${this.gqlFields} } }`
        const data = await this.gqlClient.mutation(query, {input: payload})
        return data.createFile
    }

    async update(id: string, payload: IFileBase): Promise<IFile> {
        const query = `mutation updateFile($id: ID!, $input: FileInput) { updateFile(id: $id, input: $input) { ${this.gqlFields} } }`
        const data = await this.gqlClient.mutation(query, {id, input: payload})
        return data.updateFile
    }

    async updatePartial(id: string, payload: any): Promise<IFile> {
        const query = `mutation updatePartialFile($id: ID!, $input: JSON) { updatePartialFile(id: $id, input: $input) { ${this.gqlFields} } }`
        const data = await this.gqlClient.mutation(query, {id, input: payload})
        return data.updatePartialFile
    }

    async delete(id: string): Promise<any> {
        const query = `mutation deleteFile($id: ID!) { deleteFile(id: $id) }`
        const data = await this.gqlClient.mutation(query, {id})
        return data.deleteFile
    }

    async search(value: any): Promise<IFile[]> {
        const query = `query searchFile($value: String) { searchFile(value: $value) { ${this.gqlFields} } }`
        const data = await this.gqlClient.query(query, {value})
        return data.searchFile
    }

    async findById(id: string): Promise<IFile | null> {
        const query = `query findFileById($id: ID!) { findFileById(id: $id) { ${this.gqlFields} } }`
        const data = await this.gqlClient.query(query, {id})
        return data.findFileById
    }

    async findByIds(ids: Array<string>): Promise<IFile[]> {
        const query = `query findFileByIds($ids: [ID!]) { findFileByIds(ids: $ids) { ${this.gqlFields} } }`
        const data = await this.gqlClient.query(query, {ids})
        return data.findFileByIds
    }

    async find({limit = 100, orderBy = "", order = false, search = "", filters = []}: IDraxFindOptions): Promise<IFile[]> {
        const query = `query findFile($options: FindOptions) { findFile(options: $options) { ${this.gqlFields} } }`
        const data = await this.gqlClient.query(query, {options: {limit, orderBy, order, search, filters}})
        return data.findFile
    }

    async findOne({search = "", filters = []}: IDraxFindOneOptions): Promise<IFile> {
        const query = `query findOneFile($options: FindOneOptions) { findOneFile(options: $options) { ${this.gqlFields} } }`
        const data = await this.gqlClient.query(query, {options: {search, filters}})
        return data.findOneFile
    }

    async groupBy({fields = [], filters = [], dateFormat = 'day'}: IDraxGroupByOptions): Promise<Array<any>> {
        const query = `query groupByFile($options: GroupByOptions) { groupByFile(options: $options) }`
        const data = await this.gqlClient.query(query, {options: {fields, filters, dateFormat}})
        return data.groupByFile
    }

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = "",
                       order = "asc",
                       search = "",
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<IFile>> {
        const query = `query paginateFile($options: PaginateOptions) { paginateFile(options: $options) { total page limit items { ${this.gqlFields} } } }`
        const data = await this.gqlClient.query(query, {options: {page, limit, orderBy, order, search, filters}})
        return data.paginateFile
    }

    async export({
                     format = 'JSON',
                     headers = [],
                     headersTranslate = [],
                     separator = ';',
                     fileName = 'export',
                     limit = 0,
                     orderBy = "",
                     order = false,
                     search = "",
                     filters = []
                 }: IDraxExportOptions): Promise<IDraxCrudProviderExportResult> {
        const query = `query exportFile($options: ExportOptions) { exportFile(options: $options) { data filename mimeType } }`
        const data = await this.gqlClient.query(query, {
            options: {format, headers, headersTranslate, separator, fileName, limit, orderBy, order, search, filters}
        })
        return data.exportFile
    }

}

export default FileGqlProvider
export {FileGqlProvider}
