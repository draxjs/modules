import {ValidationError, ZodErrorToValidationError} from "@drax/common-back"
import {ZodError} from "zod";
import type {ZodSchema} from "zod";
import type {
    IDraxPaginateOptions,
    IDraxPaginateResult,
    IDraxFindOptions,
    IDraxCrud,
    IDraxExportOptions
} from "@drax/crud-share";
import {IDraxCrudService} from "@drax/crud-share";
import ExportCsv from "../exports/ExportCsv.js";
import ExportJson from "../exports/ExportJson.js";
import {IDraxExportResult} from "@drax/crud-share";

class AbstractService<T, C, U> implements IDraxCrudService<T, C, U> {

    _repository: IDraxCrud<T, C, U>
    _schema?: ZodSchema | undefined

    constructor(repository: IDraxCrud<T, C, U>, schema?: ZodSchema) {
        this._repository = repository
        this._schema = schema
    }

    async create(data: C): Promise<T> {
        try {
            if (this._schema) {
                await this._schema.parseAsync(data)
            }
            const item: T = await this._repository.create(data)
            return item
        } catch (e) {
            console.error("Error creating", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, data)
            }
            throw e
        }
    }

    async update(id: string, data: U): Promise<T> {
        try {
            if (this._schema) {
                await this._schema.parseAsync(data)
            }
            const item: T = await this._repository.update(id, data)
            return item
        } catch (e) {
            console.error("Error updating", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, data)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const deleted = await this._repository.delete(id);
            return deleted;
        } catch (e) {
            console.error("Error deleting", e)
            throw e;
        }

    }

    async findById(id: string): Promise<T | null> {
        try {
            const item: T = await this._repository.findById(id);
            return item
        } catch (e) {
            console.error("Error finding Auto by id", e)
            throw e;
        }
    }

    async findByIds(ids: Array<string>): Promise<T[]> {
        try {
            const items: T[] = await this._repository.findByIds(ids);
            return items
        } catch (e) {
            console.error("Error finding Auto by id", e)
            throw e;
        }
    }

    async findOneBy(field: string, value: string): Promise<T | null> {
        try {
            const item: T = await this._repository.findOneBy(field, value);
            return item
        } catch (e) {
            console.error("Error finding Auto findOneBy", e)
            throw e;
        }

    }

    async findBy(field: string, value: string): Promise<T[] | null> {
        try {
            const items: T[] = await this._repository.findBy(field, value);
            return items
        } catch (e) {
            console.error("Error finding Auto findBy", e)
            throw e;
        }

    }

    async fetchAll(): Promise<T[]> {
        try {
            const items: T[] = await this._repository.fetchAll();
            return items
        } catch (e) {
            console.error("Error fetching all Autos", e)
            throw e;
        }

    }

    async search(value: string): Promise<T[]> {
        try {
            const items: T[] = await this._repository.search(value);
            return items
        } catch (e) {
            console.error("Error fetching all Autos", e)
            throw e;
        }

    }

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       order = false,
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<T>> {
        try {
            const pagination = await this._repository.paginate({page, limit, orderBy, order, search, filters});
            return pagination;
        } catch (e) {
            console.error("Error paginating", e)
            throw e;
        }

    }

    async find({
                   orderBy = '',
                   order = false,
                   search = '',
                   filters = []
               }: IDraxFindOptions): Promise<T[]> {
        try {
            const items = await this._repository.find({orderBy, order, search, filters});
            return items;
        } catch (e) {
            console.error("Error paginating", e)
            throw e;
        }

    }

    async export({
                     format = 'JSON',
                     headers = [],
                     separator = ';',
                     orderBy = '',
                     order = false,
                     search = '',
                     filters = []
                 }: IDraxExportOptions,
                 destinationPath: string): Promise<IDraxExportResult> {
        try {

            console.log("ExportOptions", {
                format,
                headers,
                separator,
                outputPath: destinationPath,
                orderBy,
                order,
                search,
                filters
            })

            let cursor:any
            let exporter:any

            switch (format) {
                case 'JSON':
                    cursor = await this._repository.find({orderBy, order, search, filters});
                    exporter = new ExportJson({cursor, destinationPath: destinationPath, headers});
                    return await exporter.process()
                case 'CSV':
                    cursor = await this._repository.find({orderBy, order, search, filters});
                    exporter = new ExportCsv({cursor, destinationPath: destinationPath, headers, separator});
                    return await exporter.process()
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

        } catch (e) {
            console.error("Error exporting", e)
            throw e;
        }

    }

}

export default AbstractService
export {AbstractService}
