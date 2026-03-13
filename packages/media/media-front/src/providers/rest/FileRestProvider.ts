import type {IHttpClient} from "@drax/common-front";
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IFile, IFileBase} from "@drax/media-share";
import type {IFileProvider} from "../../interfaces/IFileProvider";

class FileRestProvider extends AbstractCrudRestProvider<IFile, IFileBase, IFileBase> implements IFileProvider {

    constructor(httpClient: IHttpClient) {
        super('/api/file')
        this.httpClient = httpClient
    }

}

export default FileRestProvider
export {FileRestProvider}
