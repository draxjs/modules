import FileServiceFactory from "../factory/services/FileServiceFactory.js";
import {AbstractFastifyController, CustomRequest} from "@drax/crud-back";
import FilePermissions from "../permissions/FilePermissions.js";
import type {IFile, IFileBase} from "../interfaces/IFile";
import {StoreManager} from "@drax/common-back";

class FileController extends AbstractFastifyController<IFile, IFileBase, IFileBase>   {

    constructor() {
        super(FileServiceFactory.instance, FilePermissions)
        this.tenantField = "tenant";
        this.userField = "createdBy.id";

        this.tenantFilter = true;
        this.tenantSetter = true;
        this.tenantAssert = true;

        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

    async preUpdate(request: CustomRequest, payload:any):Promise<IFileBase>{
        delete payload.relativePath;
        delete payload.absolutePath;
        delete payload.filename;


        payload.updatedBy = {
            id: request.rbac.userId,
            username: request.rbac.username,
        }

        return payload
    }

    async postDelete(request: CustomRequest, item:IFile){
        try {
            await StoreManager.deleteFilepath(item.absolutePath)
        } catch (error) {
            console.error(error)
        }
        return item
    }
}

export default FileController;
export {
    FileController
}
