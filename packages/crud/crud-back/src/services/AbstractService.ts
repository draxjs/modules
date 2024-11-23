import {ZodErrorToValidationError} from "@drax/common-back"
import {ZodError} from "zod";
import type {ZodSchema} from "zod";
import type {
    IDraxPaginateOptions,
    IDraxPaginateResult,
    IDraxFindOptions,
    IDraxExportOptions,
    IDraxCrudRepository, IDraxFieldFilter
} from "@drax/crud-share";
import {IDraxCrudService} from "@drax/crud-share";
import ExportCsv from "../exports/ExportCsv.js";
import ExportJson from "../exports/ExportJson.js";
import {IDraxExportResult} from "@drax/crud-share";
import {IDraxFindOneOptions} from "@drax/crud-share/types/interfaces/IDraxFindOneOptions";

abstract class AbstractService<T, C, U> implements IDraxCrudService<T, C, U> {

    protected _repository: IDraxCrudRepository<T, C, U>
    protected _schema?: ZodSchema | undefined
    protected _defaultOrder?: string | undefined

    transformCreate?: (data: C) => Promise<C>;
    transformUpdate?: (data: U) => Promise<U>;
    transformRead?: (data: T) => Promise<T>;



    constructor(repository: IDraxCrudRepository<T, C, U>, schema?: ZodSchema) {
        this._repository = repository
        this._schema = schema
    }


    async create(data: C): Promise<T> {
        try {
            if (this._schema) {
                await this._schema.parseAsync(data)
            }
            if(this.transformCreate){
                data = await this.transformCreate(data)
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
            if(this.transformUpdate){
                data = await this.transformUpdate(data)
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

    async updatePartial(id: string, data: any): Promise<T> {
        try {

            const item: T = await this._repository.updatePartial(id, data)

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
            const result: boolean = await this._repository.delete(id);
            if(!result){
                throw new Error("error.deletionFailed");
            }
            return result;
        } catch (e) {
            console.error("Error deleting", e)
            throw e;
        }

    }

    async findById(id: string): Promise<T | null> {
        try {
            let item: T = await this._repository.findById(id);
            if(this.transformRead){
                item = await this.transformRead(item)
            }
            return item
        } catch (e) {
            console.error("Error finding Auto by id", e)
            throw e;
        }
    }

    async findByIds(ids: Array<string>): Promise<T[]> {
        try {
            let items: T[] = await this._repository.findByIds(ids);
            if(this.transformRead){
                items = await Promise.all(items.map( item =>  this.transformRead(item)))
            }
            return items
        } catch (e) {
            console.error("Error finding Auto by id", e)
            throw e;
        }
    }

    async findOneBy(field: string, value: string): Promise<T | null> {
        try {
            let item: T = await this._repository.findOneBy(field, value);
            if(this.transformRead){
                item = await this.transformRead(item)
            }
            return item
        } catch (e) {
            console.error("Error finding Auto findOneBy", e)
            throw e;
        }

    }

    async findBy(field: string, value: string): Promise<T[] | null> {
        try {
            let items: T[] = await this._repository.findBy(field, value);
            if(this.transformRead){
                items = await Promise.all(items.map( item =>  this.transformRead(item)))
            }
            return items
        } catch (e) {
            console.error("Error finding Auto findBy", e)
            throw e;
        }

    }

    async fetchAll(): Promise<T[]> {
        try {
            let items: T[] = await this._repository.fetchAll();
            if(this.transformRead){
                items = await Promise.all(items.map( item =>  this.transformRead(item)))
            }
            return items
        } catch (e) {
            console.error("Error fetching all Autos", e)
            throw e;
        }

    }

    async search(value: string, limit: number = 1000, filters: IDraxFieldFilter[] = []): Promise<T[]> {
        try {
            let items: T[] = await this._repository.search(value, limit, filters);
            if(this.transformRead){
                items = await Promise.all(items.map( item =>  this.transformRead(item)))
            }
            return items
        } catch (e) {
            console.error("Error fetching all Autos", e)
            throw e;
        }

    }

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = this._defaultOrder,
                       order = false,
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<T>> {
        try {
            const pagination = await this._repository.paginate({page, limit, orderBy, order, search, filters});

            if(this.transformRead){
                pagination.items = await Promise.all(pagination.items.map( item =>  this.transformRead(item)))
            }

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
            let items = await this._repository.find({orderBy, order, search, filters});
            return items;
        } catch (e) {
            console.error("Error find", e)
            throw e;
        }

    }

    async findOne({
                   search = '',
                   filters = []
               }: IDraxFindOneOptions): Promise<T> {
        try {
            let item = await this._repository.findOne({ search, filters});
            return item;
        } catch (e) {
            console.error("Error findOne", e)
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

            let cursor:any
            let exporter:any

            if(this._repository.findCursor){
                cursor = await this._repository.findCursor({orderBy, order, search, filters});
            }else{
                cursor = await this._repository.find({orderBy, order, search, filters});
            }

            switch (format) {
                case 'JSON':
                    exporter = new ExportJson({cursor, destinationPath: destinationPath, headers});
                    return await exporter.process()
                case 'CSV':
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
