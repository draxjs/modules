
import {AbstractMongoRepository} from "@drax/crud-back";
import {FileModel} from "../../models/FileModel.js";
import type {IFileRepository} from '../../interfaces/IFileRepository'
import type {IFile, IFileBase} from "../../interfaces/IFile";


class FileMongoRepository extends AbstractMongoRepository<IFile, IFileBase, IFileBase> implements IFileRepository {

    constructor() {
        super();
        this._model = FileModel;
        this._searchFields = ['filename', 'relativePath', 'absolutePath', 'url', 'description', 'tags', 'mimetype', 'extension', 'type'];
        this._populateFields = [];
        this._lean = true
    }

}

export default FileMongoRepository
export {FileMongoRepository}

