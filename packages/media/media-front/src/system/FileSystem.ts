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
import type {IFileProvider} from "../interfaces/IFileProvider";

class FileSystem implements IFileProvider {

    _provider: IFileProvider
    prototype: string;

    constructor(provider: IFileProvider) {
        this._provider = provider;
        this.prototype = 'FileSystem'
    }

    paginate(options: IDraxPaginateOptions): Promise<IDraxPaginateResult<IFile>> {
        return this._provider.paginate(options)
    }

    create(input: IFileBase): Promise<IFile> {
        if(!this._provider.create){
            throw new Error("Create method not implemented")
        }

        return this._provider.create(input)
    }

    update(id: string, input: IFileBase): Promise<IFile> {
        if(!this._provider.update){
            throw new Error("Update method not implemented")
        }

        return this._provider.update(id, input)
    }

    delete(id: string): Promise<any> {
        if(!this._provider.delete){
            throw new Error("Delete method not implemented")
        }

        return this._provider.delete(id)
    }

    updatePartial(id: string, input: any): Promise<IFile> {
        if(!this._provider.updatePartial){
            throw new Error("UpdatePartial method not implemented")
        }

        return this._provider.updatePartial(id, input)
    }

    findById(id: string): Promise<IFile | null> {
        if(!this._provider.findById){
            throw new Error("FindById method not implemented")
        }

        return this._provider.findById(id)
    }

    findByIds(ids: Array<string>): Promise<IFile[]> {
        if(!this._provider.findByIds){
            throw new Error("FindByIds method not implemented")
        }

        return this._provider.findByIds(ids)
    }

    search(value: any): Promise<IFile[]> {
        if(!this._provider.search){
            throw new Error("Search method not implemented")
        }

        return this._provider.search(value)
    }

    find(options: IDraxFindOptions): Promise<IFile[]> {
        if(!this._provider.find){
            throw new Error("Find method not implemented")
        }

        return this._provider.find(options)
    }

    findOne(options: IDraxFindOneOptions): Promise<IFile> {
        if(!this._provider.findOne){
            throw new Error("FindOne method not implemented")
        }

        return this._provider.findOne(options)
    }

    groupBy(options: IDraxGroupByOptions): Promise<Array<any>> {
        if(!this._provider.groupBy){
            throw new Error("GroupBy method not implemented")
        }

        return this._provider.groupBy(options)
    }

    export(options: IDraxExportOptions): Promise<IDraxCrudProviderExportResult> {
        if(!this._provider.export){
            throw new Error("Export method not implemented")
        }

        return this._provider.export(options)
    }

}

export default FileSystem
export {FileSystem}
