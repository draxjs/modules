
import type{IFileRepository} from "../interfaces/IFileRepository.js";
import type {IFileBase, IFile} from "../interfaces/IFile.js";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import {StoreManager} from "@drax/common-back";

class FileService extends AbstractService<IFile, IFileBase, IFileBase> {

    constructor(FileRepository: IFileRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(FileRepository, baseSchema, fullSchema);

        this._validateOutput = true
        this.onDeleted = async (id: string, item?: IFile | null): Promise<void> => {
            if (!item?.relativePath) {
                return;
            }

            try {
                await StoreManager.deleteFilepath(item.relativePath);
            } catch (error) {
                console.error(error);
            }
        }

    }

    async registerUploadedFile(data: IFileBase): Promise<IFile> {
        return await this.create(data);
    }

    async registerDownloadHit(relativePath: string): Promise<IFile | null> {
        const file = await this.findOneBy('relativePath', relativePath);
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
