
import FileServiceFactory from "../factory/services/FileServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import FilePermissions from "../permissions/FilePermissions.js";
import type {IFile, IFileBase} from "../interfaces/IFile";

class FileController extends AbstractFastifyController<IFile, IFileBase, IFileBase>   {

    constructor() {
        super(FileServiceFactory.instance, FilePermissions)
        this.tenantField = "tenant";
        this.userField = "createdBy";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

}

export default FileController;
export {
    FileController
}

