
import type{IFileRepository} from "../interfaces/IFileRepository.js";
import type {IFileBase, IFile} from "../interfaces/IFile.js";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class FileService extends AbstractService<IFile, IFileBase, IFileBase> {


    constructor(FileRepository: IFileRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(FileRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

    async registerUploadedFile(data: IFileBase): Promise<IFile> {
        return await this.create(data);
    }

    async registerDownloadHit(absolutePath: string): Promise<IFile | null> {
        const file = await this.findOneBy('absolutePath', absolutePath);
        if (!file) {
            return null;
        }

        return await this.updatePartial(file._id, {
            hits: (file.hits || 0) + 1,
            lastAccess: new Date()
        });
    }

}

export default FileService
export {FileService}
