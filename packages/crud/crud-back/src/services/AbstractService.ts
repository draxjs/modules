import {ZodErrorToValidationError} from "@drax/common-back"
import {ZodError} from "zod";
import type {ZodObject, ZodRawShape} from "zod";
import type {
    IDraxPaginateOptions,
    IDraxPaginateResult,
    IDraxFindOptions,
    IDraxExportOptions,
    IDraxCrudRepository, IDraxFieldFilter, IDraxGroupByOptions
} from "@drax/crud-share";
import {IDraxCrudService} from "@drax/crud-share";
import ExportCsv from "../exports/ExportCsv.js";
import ExportJson from "../exports/ExportJson.js";
import {IDraxExportResult} from "@drax/crud-share";
import {IDraxFindOneOptions} from "@drax/crud-share/types/interfaces/IDraxFindOneOptions";

abstract class AbstractService<T, C, U> implements IDraxCrudService<T, C, U> {

    protected _repository: IDraxCrudRepository<T, C, U>
    protected _baseSchema?: ZodObject<ZodRawShape> | undefined
    protected _fullSchema?: ZodObject<ZodRawShape> | undefined
    protected _defaultOrder?: string | undefined
    protected _validateOutput: boolean = true

    transformCreate?: (data: C) => Promise<C>;
    transformUpdate?: (data: U) => Promise<U>;
    transformRead?: (data: T) => Promise<T>;

    onCreated?: (data: T) => Promise<void>;
    onUpdated?: (data: T) => Promise<void>;
    onDeleted?: (id: string) => Promise<void>;


    constructor(repository: IDraxCrudRepository<T, C, U>, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        this._repository = repository
        this._baseSchema = baseSchema
        this._fullSchema = fullSchema
    }

    async validateInputCreate(data: C): Promise<C> {
        if (this._baseSchema) {
            try {
                return await this._baseSchema.parseAsync(data) as C
            } catch (e) {
                console.error("Error on validateInputCreate", {
                    name: e?.name,
                    message: e?.message,
                    stack: e?.stack,
                });
                if (e instanceof ZodError) {
                    throw ZodErrorToValidationError(e, data)
                }
                throw e
            }
        }
        return data
    }

    async validateInputUpdate(data: U): Promise<U> {
        if (this._baseSchema) {
            try {
                return await this._baseSchema.partial().parseAsync(data) as U
            } catch (e) {
                console.error("Error on validateInputUpdate", {
                    name: e?.name,
                    message: e?.message,
                    stack: e?.stack,
                });
                if (e instanceof ZodError) {
                    throw ZodErrorToValidationError(e, data)
                }
                throw e
            }
        }
        return data
    }

    async validateInputUpdatePartial(data: U): Promise<U> {
        if (this._baseSchema) {
            try {
                //Fix no retornamos el parseo porque completa todos los campos con default
                await this._baseSchema.partial().parseAsync(data) as U
                return data
            } catch (e) {
                console.error("Error on validateInputUpdatePartial", {
                    name: e?.name,
                    message: e?.message,
                    stack: e?.stack,
                });
                if (e instanceof ZodError) {
                    throw ZodErrorToValidationError(e, data)
                }
                throw e
            }
        }
        return data
    }

    async validateOutput(item: T): Promise<T> {
        if (this._validateOutput && item && this._fullSchema) {
            try {
                return await this._fullSchema.parseAsync(item) as T
            } catch (e) {
                console.error("Error on validateOutput", {
                    name: e?.name,
                    message: e?.message,
                    stack: e?.stack,
                });
                throw e
            }
        }
        return item
    }

    async create(data: C): Promise<T> {

        data = await this.validateInputCreate(data)

        if (this.transformCreate) {
            data = await this.transformCreate(data)
        }

        let item: T = await this._repository.create(data)

        if (this.onCreated) {
            await this.onCreated(item)
        }

        item = await this.validateOutput(item)

        return item

    }

    async update(id: string, data: U): Promise<T> {

        data = await this.validateInputUpdate(data)

        if (this.transformUpdate) {
            data = await this.transformUpdate(data)
        }

        let item: T = await this._repository.update(id, data)

        if (this.onUpdated) {
            await this.onUpdated(item)
        }

        item = await this.validateOutput(item)

        return item

    }

    async updatePartial(id: string, data: any): Promise<T> {

        data = await this.validateInputUpdatePartial(data)

        let item: T = await this._repository.updatePartial(id, data)

        if (this.onUpdated) {
            await this.onUpdated(item)
        }

        item = await this.validateOutput(item)

        return item

    }

    async delete(id: string): Promise<boolean> {
        try {
            const result: boolean = await this._repository.delete(id);
            if (!result) {
                throw new Error("error.deletionFailed");
            }
            if (this.onDeleted) {
                await this.onDeleted(id)
            }
            return result;
        } catch (e) {
            console.error("Error delete", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack,
            });
            throw e;
        }

    }

    async findById(id: string): Promise<T | null> {
        try {

            let item: T = await this._repository.findById(id)

            if (item && this.transformRead) {
                item = await this.transformRead(item)
            }

            item = await this.validateOutput(item)

            return item

        } catch (e) {
            console.error("Error findById", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack,
            });
            throw e;
        }
    }



    async findOneBy(field: string, value: any): Promise<T | null> {
        try {

            let item: T = await this._repository.findOneBy(field, value)

            if (item && this.transformRead) {
                item = await this.transformRead(item)
            }

            item = await this.validateOutput(item)

            return item
        } catch (e) {
            console.error("Error findOneBy", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack,
            });
            throw e;
        }

    }

    async findOne({
                      search = '',
                      filters = []
                  }: IDraxFindOneOptions): Promise<T> {
        try {
            let item = await this._repository.findOne({search, filters});

            if (item && this.transformRead) {
                item = await this.transformRead(item)
            }

            item = await this.validateOutput(item)

            return item
        } catch (e) {
            console.error("Error findOne", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack,
            });
            throw e;
        }

    }

    async findByIds(ids: Array<string>): Promise<T[]> {
        try {

            let items: T[] = await this._repository.findByIds(ids)

            if (this.transformRead) {
                items = await Promise.all(items.map(item => this.transformRead(item)))
            }

            if(this._fullSchema){
                items = await Promise.all(items.map(item => this.validateOutput(item)))
            }

            return items
        } catch (e) {
            console.error("Error findByIds", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack,
            });
            throw e;
        }
    }

    async findBy(field: string, value: any, limit: number = 1000): Promise<T[] | null> {
        try {

            let items: T[] = await this._repository.findBy(field, value, limit);
            if (this.transformRead) {
                items = await Promise.all(items.map(item => this.transformRead(item)))
            }
            if(this._fullSchema){
                items = await Promise.all(items.map(item => this.validateOutput(item)))
            }
            return items
        } catch (e) {
            console.error("Error findBy", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack,
            });
            throw e;
        }

    }

    async fetchAll(): Promise<T[]> {
        try {
            let items: T[] = await this._repository.fetchAll();
            if (this.transformRead) {
                items = await Promise.all(items.map(item => this.transformRead(item)))
            }
            if(this._fullSchema){
                items = await Promise.all(items.map(item => this.validateOutput(item)))
            }
            return items
        } catch (e) {
            console.error("Error fetchAll", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack,
            });
            throw e;
        }

    }

    async search(value: string, limit: number = 1000, filters: IDraxFieldFilter[] = []): Promise<T[]> {
        try {

            let items: T[] = await this._repository.search(value, limit, filters);
            if (this.transformRead) {
                items = await Promise.all(items.map(item => this.transformRead(item)))
            }
            if(this._fullSchema){
                items = await Promise.all(items.map(item => this.validateOutput(item)))
            }
            return items
        } catch (e) {
            console.error("Error search", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack,
            });
            throw e;
        }

    }

    async paginate({
                       page = 1,
                       limit = 10,
                       orderBy = this._defaultOrder,
                       order = "asc",
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<T>> {
        try {


            const pagination = await this._repository.paginate({page, limit, orderBy, order, search, filters});

            if (this.transformRead) {
                pagination.items = await Promise.all(pagination.items.map(item => this.transformRead(item)))
            }

            if(this._fullSchema){
                pagination.items = await Promise.all(pagination.items.map(item => this.validateOutput(item)))
            }

            return pagination;
        } catch (e) {
            console.error("Error paginate", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack,
            });
            throw e;
        }

    }

    async find({
                   orderBy = '',
                   order = false,
                   search = '',
                   filters = [],
                   limit = 0,
               }: IDraxFindOptions): Promise<T[]> {
        try {

            let items = await this._repository.find({orderBy, order, search, filters, limit});
            if (this.transformRead) {
                items = await Promise.all(items.map(item => this.transformRead(item)))
            }
            if(this._fullSchema){
                items = await Promise.all(items.map(item => this.validateOutput(item)))
            }
            return items;
        } catch (e) {
            console.error("Error find", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack,
            });
            throw e;
        }

    }



    async groupBy({fields = [], filters = [], dateFormat = 'day'}: IDraxGroupByOptions): Promise<Array<any>> {
        return await this._repository.groupBy({fields, filters, dateFormat})
    }

    async export({
                     format = 'JSON',
                     headers = [],
                     headersTranslate = [],
                     separator = ';',
                     fileName = 'export',
                     orderBy = '',
                     order = false,
                     search = '',
                     filters = []
                 }: IDraxExportOptions,
                 destinationPath: string): Promise<IDraxExportResult> {
        try {

            let cursor: any
            let exporter: any

            if (this._repository.findCursor) {
                cursor = await this._repository.findCursor({orderBy, order, search, filters});
            } else {
                cursor = await this._repository.find({orderBy, order, search, filters});
            }

            switch (format) {
                case 'JSON':
                    exporter = new ExportJson({cursor, destinationPath: destinationPath, headers, fileName});
                    return await exporter.process()
                case 'CSV':
                    exporter = new ExportCsv({
                        cursor,
                        destinationPath: destinationPath,
                        headers,
                        headersTranslate,
                        fileName,
                        separator
                    });
                    return await exporter.process()
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

        } catch (e) {
            console.error("Error export", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack,
            });
            throw e;
        }

    }

}

export default AbstractService
export {AbstractService}
