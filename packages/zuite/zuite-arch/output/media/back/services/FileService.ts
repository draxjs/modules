
import type{IFileRepository} from "../interfaces/IFileRepository";
import type {IFileBase, IFile} from "../interfaces/IFile";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class FileService extends AbstractService<IFile, IFileBase, IFileBase> {


    constructor(FileRepository: IFileRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(FileRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default FileService
export {FileService}
