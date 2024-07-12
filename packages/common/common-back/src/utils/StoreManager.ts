import type {IUploadFile, IUploadFileResult, IUploadFileOptions} from "../interfaces/IUploadFile";
import {join} from "path";
import {unlink} from "node:fs"
import crypto from "crypto";
import UploadFileError from "../errors/UploadFileError.js";
import createDirIfNotExist from "./CreateDirIfNotExist.js";
import StreamFileStore from "./StreamFileStore.js";
import {Readable} from "stream";

class StoreManager {


    static getExtension(filename: string): string {
        const parts = filename.split('.');
        return parts[parts.length - 1];
    }

    static async saveFile(file: IUploadFile, destinationPath: string, options?: IUploadFileOptions): Promise<IUploadFileResult> {

        if (!file.filename) {
            throw new UploadFileError('Empty filename');
        }

        //Verify if file.fileStream is a Readable stream
        if (!(file.fileStream instanceof Readable)) {
            throw new UploadFileError('Invalid fileStream');
        }

        //Validate file extension and mimetype
        const extension = this.getExtension(file.filename)
        if (options?.extensions && !options.extensions.includes(extension)) {
            throw new UploadFileError('Invalid file extension');
        }

        if (options?.mimetypes && !options.mimetypes.includes(file.mimetype)) {
            throw new UploadFileError('Invalid file mimetype');
        }

        //Improve filename uniqueness and split into year and month folders
        const random = crypto.randomBytes(8).toString('hex')
        const year = (new Date().getFullYear()).toString()
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
        const filename = `${year}-${month}-${random}-${file.filename.replace(/\s+/g,'-')}`;
        destinationPath = join(destinationPath, year, month);

        createDirIfNotExist(destinationPath)
        const destinationFile = join(destinationPath, filename);

        // Validate file size before saving
        const maxSizeEnv = process.env.DRAX_MAX_UPLOAD_SIZE ? parseInt(process.env.DRAX_MAX_UPLOAD_SIZE) : 1;
        const maxSize = options?.maxSize || maxSizeEnv;

        const {bytesWritten} = await StreamFileStore(file.fileStream, maxSize, destinationFile)

        const fileUploadResult: IUploadFileResult = {
            filename: filename,
            path: destinationFile,
            mimetype: file.mimetype,
            encoding: file.encoding,
            size: bytesWritten
        }

        return fileUploadResult
    }

    static async readFile(dirPath: string, filename: string): Promise<void> {
        const filePath = join(dirPath, filename);
    }


    static async deleteFile(dirPath: string, filename: string): Promise<void> {
        const filePath = join(dirPath, filename);
        unlink(filePath, (err) => {
            if (err) throw err;
            console.log('path/ file. txt was deleted');
        });
    }
}

export {StoreManager}
export default StoreManager
